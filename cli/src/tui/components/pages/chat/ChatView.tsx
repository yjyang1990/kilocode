import React, { useState, useEffect, useCallback } from "react"
import { Box } from "ink"
import { Text } from "../../common/Text.js"
import TextInput from "ink-text-input"
import { ScrollArea, useScrollArea } from "../../common/ScrollArea.js"
import { logService } from "../../../../services/LogService.js"
import type { ExtensionMessage, ClineMessage } from "../../../../types/messages.js"
import { PageHeader } from "../../generic/PageHeader.js"
import { EmptyState } from "../../generic/EmptyState.js"
import { PageLayout } from "../../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../context/index.js"
import { ChatMessageRow } from "./ChatMessageRow.js"
import { BrowserSessionGroup } from "./components/BrowserSessionGroup.js"
import { TaskHeader } from "./components/TaskHeader.js"
import { groupMessages, getApiMetrics, getLatestTodos, type MessageGroup } from "./utils/messageGrouping.js"

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

	// Use the scroll area hook for managing scroll state
	const { scrollTop, isAtBottom, scrollToBottom, scrollToTop, onScrollChange } = useScrollArea()

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

	// Group messages for enhanced display
	const groupedMessages = groupMessages(chatState.messages.slice(1)) // Skip first message (task)
	const apiMetrics = getApiMetrics(chatState.messages)
	const latestTodos = getLatestTodos(chatState.messages)
	const task = chatState.messages[0] // First message is the task

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
			// Arrow keys are now handled by ScrollArea component
			// We can add additional shortcuts here if needed
			"ctrl+e": () => {
				// Scroll to bottom
				scrollToBottom()
			},
			"ctrl+a": () => {
				// Scroll to top
				scrollToTop()
			},
		},
	})

	// Auto-scroll to bottom when new messages arrive
	// The ScrollArea component handles this automatically with its autoScroll prop
	// We just need to trigger it when messages change
	useEffect(() => {
		// If user is at bottom or it's a new conversation, auto-scroll
		if (isAtBottom || chatState.messages.length <= 1) {
			// Longer delay when loading many messages (e.g., from history) to ensure content is fully measured
			// The delay accounts for: content rendering + measurement debounce + scroll processing
			const delay = chatState.messages.length > 5 ? 200 : 100
			setTimeout(() => {
				scrollToBottom()
			}, delay)
		}
	}, [chatState.messages, isAtBottom, scrollToBottom])

	// Determine if we have an active ask
	const lastMessage = chatState.messages[chatState.messages.length - 1]
	const hasActiveAsk = lastMessage?.type === "ask" && lastMessage?.ask === "" && !lastMessage.partial

	// Create header with streaming status - use TaskHeader when task is available
	const header = task ? (
		<TaskHeader
			task={task}
			tokensIn={apiMetrics.totalTokensIn}
			tokensOut={apiMetrics.totalTokensOut}
			totalCost={apiMetrics.totalCost}
			contextTokens={apiMetrics.contextTokens}
			todos={latestTodos}
			mode={extensionState?.mode || "code"}
			isStreaming={chatState.isStreaming}
			asPageHeader={true}
		/>
	) : (
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
		<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} overflow="hidden">
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
				<Box flexDirection="column" flexGrow={1}>
					{/* Messages - scrollable area with smooth scrolling */}
					<ScrollArea
						height={"100%"}
						autoScroll={true}
						scrollSpeed={3}
						onScrollChange={onScrollChange}
						showBorder={false}
						isActive={inputMode !== "input"}
						isFocused={inputMode !== "input"}>
						{groupedMessages.map((group: MessageGroup, index: number) => {
							if (group.type === "browser_session") {
								return (
									<BrowserSessionGroup
										key={group.id}
										messages={group.messages}
										isLast={index === groupedMessages.length - 1}
										isStreaming={chatState.isStreaming}
									/>
								)
							} else {
								// Single message
								const message = group.messages[0]
								if (!message) return null

								return (
									<ChatMessageRow
										key={`${message.ts}-${index}`}
										message={message}
										isLast={index === groupedMessages.length - 1}
										isStreaming={chatState.isStreaming}
										lastModifiedMessage={chatState.messages[chatState.messages.length - 1]}
									/>
								)
							}
						})}
					</ScrollArea>
				</Box>
			)}
		</Box>
	)

	// Create input area
	const inputArea = (
		<Box borderStyle="single" borderColor="gray" paddingX={1} flexShrink={0}>
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
