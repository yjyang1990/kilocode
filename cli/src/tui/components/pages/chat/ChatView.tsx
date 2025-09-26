import React, { useState, useEffect, useCallback } from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import { ScrollBox } from "@sasaplus1/ink-scroll-box"
import { logService } from "../../../../services/LogService.js"
import type { ExtensionMessage, ClineMessage } from "../../../../types/messages.js"
import { PageHeader } from "../../generic/PageHeader.js"
import { EmptyState } from "../../generic/EmptyState.js"
import { PageLayout } from "../../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../context/index.js"
import { ChatMessageRow } from "./ChatMessageRow.js"

interface ChatState {
	messages: ClineMessage[]
	inputValue: string
	isStreaming: boolean
	isWaitingForResponse: boolean
	currentAsk: string | null
}

export const ChatView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage, handleMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const [chatState, setChatState] = useState<ChatState>({
		messages: [],
		inputValue: "",
		isStreaming: false,
		isWaitingForResponse: false,
		currentAsk: null,
	})

	const [inputMode, setInputMode] = useState<"normal" | "input">("normal")
	const [scrollOffset, setScrollOffset] = useState(0)

	// Update messages when extension state changes
	useEffect(() => {
		if (extensionState?.clineMessages) {
			logService.debug(`Updating chat messages: ${extensionState.clineMessages.length} messages`, "ChatView")
			setChatState((prev) => ({
				...prev,
				messages: extensionState.clineMessages,
				isStreaming: extensionState.clineMessages.some((msg: any) => msg.partial === true),
			}))
		}
	}, [extensionState?.clineMessages])

	// Handle extension messages - improved message handling
	useEffect(() => {
		const handleMessage = (message: ExtensionMessage) => {
			logService.debug(`ChatView received extension message: ${message.type}`, "ChatView")

			switch (message.type) {
				case "state":
					// Update entire state when received
					if (message.state?.clineMessages) {
						logService.debug(`State update: ${message.state.clineMessages.length} messages`, "ChatView")
						setChatState((prev) => ({
							...prev,
							messages: message.state!.clineMessages,
							isStreaming: message.state!.clineMessages.some((msg: any) => msg.partial === true),
						}))
					}
					break
				case "messageUpdated":
					if (message.clineMessage) {
						setChatState((prev) => {
							const updatedMessages = prev.messages.map((msg) =>
								msg.ts === message.clineMessage?.ts ? message.clineMessage : msg,
							)
							return {
								...prev,
								messages: updatedMessages,
								isStreaming: updatedMessages.some((msg: any) => msg.partial === true),
							}
						})
					}
					break
				case "action":
					switch (message.action) {
						case "didBecomeVisible":
							logService.debug("ChatView became visible", "ChatView")
							break
						case "focusInput":
							logService.debug("Focus input requested", "ChatView")
							break
					}
					break
				case "selectedImages":
					if (message.images && message.context !== "edit") {
						logService.debug("Selected images received", "ChatView", { count: message.images.length })
					}
					break
				case "invoke":
					switch (message.invoke) {
						case "newChat":
							setChatState((prev) => ({
								...prev,
								messages: [],
								inputValue: "",
								isStreaming: false,
								isWaitingForResponse: false,
								currentAsk: null,
							}))
							break
						case "setChatBoxMessage":
							if (message.text) {
								setChatState((prev) => ({
									...prev,
									inputValue: prev.inputValue + (prev.inputValue ? " " : "") + message.text,
								}))
							}
							break
					}
					break
				case "condenseTaskContextResponse":
					setChatState((prev) => ({
						...prev,
						isWaitingForResponse: false,
					}))
					break
			}
		}

		// Connect to extension message handling through props
		// Note: This sets up the message handler but doesn't call it directly
		// The actual messages will be received through the onExtensionMessage prop
		logService.debug("ChatView message handler setup complete", "ChatView")

		// Register the message handler with the parent component
		// This is a workaround since onExtensionMessage expects a single message, not a handler
		// In practice, the parent TUI App will call this handler when messages are received
	}, [handleMessage])

	const handleSendMessage = useCallback(async () => {
		if (!chatState.inputValue.trim()) {
			return
		}

		const text = chatState.inputValue.trim()
		setChatState((prev) => ({ ...prev, inputValue: "", isWaitingForResponse: true }))

		try {
			if (chatState.messages.length === 0) {
				// New task
				await sendMessage({
					type: "newTask",
					text,
				})
			} else {
				// Continue conversation
				await sendMessage({
					type: "askResponse",
					askResponse: "messageResponse",
					text,
				})
			}
		} catch (error) {
			logService.error("Failed to send message", "ChatView", { error })
			setChatState((prev) => ({ ...prev, isWaitingForResponse: false }))
		}

		setInputMode("normal")
	}, [chatState.inputValue, chatState.messages.length, sendMessage])

	const handleApprove = useCallback(async () => {
		try {
			await sendMessage({
				type: "askResponse",
				askResponse: "yesButtonClicked",
			})
			setChatState((prev) => ({ ...prev, currentAsk: null }))
		} catch (error) {
			logService.error("Failed to approve", "ChatView", { error })
		}
	}, [sendMessage])

	const handleReject = useCallback(async () => {
		try {
			await sendMessage({
				type: "askResponse",
				askResponse: "noButtonClicked",
			})
			setChatState((prev) => ({ ...prev, currentAsk: null }))
		} catch (error) {
			logService.error("Failed to reject", "ChatView", { error })
		}
	}, [sendMessage])

	// Use the new keyboard navigation hook
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			return: () => {
				if (inputMode !== "input") {
					setInputMode("input")
				}
			},
			y: () => {
				if (chatState.currentAsk) {
					handleApprove()
				}
			},
			n: () => {
				if (chatState.currentAsk) {
					handleReject()
				}
			},
			upArrow: () => {
				if (chatState.messages.length > 0) {
					setScrollOffset((prev) => Math.max(0, prev - 1))
				}
			},
			downArrow: () => {
				if (chatState.messages.length > 0) {
					setScrollOffset((prev) => prev + 1)
				}
			},
		},
	})

	// Auto-scroll to bottom when new messages arrive - keep user's scroll position unless they're at bottom
	useEffect(() => {
		if (chatState.messages.length > 0) {
			// Only auto-scroll if user was already at the bottom (scrollOffset is 0)
			// This preserves user's scroll position when they're reading older messages
			setScrollOffset((prev) => (prev === 0 ? 0 : prev))
		}
	}, [chatState.messages.length])

	// Determine if we have an active ask
	const lastMessage = chatState.messages[chatState.messages.length - 1]
	const hasActiveAsk = lastMessage?.type === "ask" && lastMessage?.ask === "" && !lastMessage.partial

	// Create header with streaming status
	const header = (
		<PageHeader
			title="Chat"
			subtitle={`Mode: ${extensionState?.mode || "code"}`}
			actions={
				chatState.isStreaming ? (
					<Box>
						<Text color="yellow">Thinking...</Text>
					</Box>
				) : undefined
			}
		/>
	)

	// Create main content
	const content = (
		<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
			{chatState.messages.length === 0 ? (
				<EmptyState
					title="Welcome to Kilo Code CLI!"
					description={[
						"Type your task or question and press Enter to start.",
						"Press Enter to start typing, y/n to approve/reject actions",
						"Press Esc to open the navigation menu",
					]}
					isLoading={chatState.isStreaming}
					loadingText="Thinking..."
				/>
			) : (
				<ScrollBox height="100%" offset={scrollOffset}>
					{[...chatState.messages.map((message, index) => <ChatMessageRow key={index} message={message} />)]}
				</ScrollBox>
			)}
		</Box>
	)

	// Create input area
	const inputArea = (
		<Box borderStyle="single" borderColor="gray" paddingX={1} flexGrow={1} flexShrink={0}>
			{inputMode === "input" ? (
				<Box>
					<TextInput
						value={chatState.inputValue}
						onChange={(value) => setChatState((prev) => ({ ...prev, inputValue: value }))}
						onSubmit={handleSendMessage}
						placeholder="Type your message..."
					/>
				</Box>
			) : (
				<Box>
					{hasActiveAsk ? (
						<Box gap={2}>
							<Text color="yellow">Action required:</Text>
							<Text color="green">[y]es</Text>
							<Text color="red">[n]o</Text>
						</Box>
					) : (
						<Text color="gray">
							Press <Text color="blue">Enter</Text> to type a message
						</Text>
					)}
				</Box>
			)}
		</Box>
	)

	return (
		<PageLayout header={header}>
			{content}
			{inputArea}
		</PageLayout>
	)
}
