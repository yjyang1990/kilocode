import React, { useState, useEffect, useCallback } from "react"
import { Box, Text, useInput } from "ink"
import TextInput from "ink-text-input"
import Spinner from "ink-spinner"
import { logService } from "../../services/LogService.js"
import type { ExtensionState, WebviewMessage, ExtensionMessage, ClineMessage } from "../../types/messages.js"

interface ChatViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onExtensionMessage: (message: ExtensionMessage) => void
}

interface ChatState {
	messages: ClineMessage[]
	inputValue: string
	isStreaming: boolean
	isWaitingForResponse: boolean
	currentAsk: string | null
}

export const ChatView: React.FC<ChatViewProps> = ({ extensionState, sendMessage, onExtensionMessage }) => {
	const [chatState, setChatState] = useState<ChatState>({
		messages: [],
		inputValue: "",
		isStreaming: false,
		isWaitingForResponse: false,
		currentAsk: null,
	})

	const [inputMode, setInputMode] = useState<"normal" | "input">("normal")

	// Update messages when extension state changes
	useEffect(() => {
		if (extensionState?.clineMessages) {
			setChatState((prev) => ({
				...prev,
				messages: extensionState.clineMessages,
			}))
		}
	}, [extensionState?.clineMessages])

	// Handle extension messages - simplified without dependencies
	useEffect(() => {
		const handleMessage = (message: ExtensionMessage) => {
			logService.debug(`ChatView received extension message: ${message.type}`, "ChatView")

			switch (message.type) {
				case "messageUpdated":
					if (message.clineMessage) {
						setChatState((prev) => ({
							...prev,
							messages: prev.messages.map((msg) =>
								msg.ts === message.clineMessage?.ts ? message.clineMessage : msg,
							),
						}))
					}
					break
				case "action":
					switch (message.action) {
						case "didBecomeVisible":
							// Focus handling for CLI
							logService.debug("ChatView became visible", "ChatView")
							break
						case "focusInput":
							// Focus input handling for CLI
							logService.debug("Focus input requested", "ChatView")
							break
					}
					break
				case "selectedImages":
					// Handle image selection in CLI context
					if (message.images && message.context !== "edit") {
						logService.debug("Selected images received", "ChatView", { count: message.images.length })
						// For CLI, we might handle images differently
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
						case "sendMessage":
							// Handle send message invoke
							logService.debug("Invoke sendMessage received", "ChatView")
							break
						case "setChatBoxMessage":
							if (message.text) {
								setChatState((prev) => ({
									...prev,
									inputValue: prev.inputValue + (prev.inputValue ? " " : "") + message.text,
								}))
							}
							break
						case "primaryButtonClick":
							// Handle primary button click
							logService.debug("Invoke primaryButtonClick received", "ChatView")
							break
						case "secondaryButtonClick":
							// Handle secondary button click
							logService.debug("Invoke secondaryButtonClick received", "ChatView")
							break
					}
					break
				case "condenseTaskContextResponse":
					// Handle context condensing response
					logService.debug("Context condensing response received", "ChatView")
					setChatState((prev) => ({
						...prev,
						isWaitingForResponse: false,
					}))
					break
				default:
					logService.debug(`Unhandled message type in ChatView: ${message.type}`, "ChatView")
					break
			}
		}

		// Connect to extension message handling through props
		logService.debug("ChatView message handler setup", "ChatView")
		// The actual message handling will be done through the callback above
		// when messages are received via onExtensionMessage prop
	}, [onExtensionMessage])

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

	// Local input handling - only when in chat view and not in input mode
	useInput((input, key) => {
		if (inputMode === "input") {
			return // Let TextInput handle it
		}

		// Don't handle Ctrl key combinations - let the parent App handle them
		if (key.ctrl) {
			return
		}

		if (key.return) {
			setInputMode("input")
		} else if (input === "y" && chatState.currentAsk) {
			handleApprove()
		} else if (input === "n" && chatState.currentAsk) {
			handleReject()
		}
	})

	// Determine if we have an active ask
	const lastMessage = chatState.messages[chatState.messages.length - 1]
	const hasActiveAsk = lastMessage?.type === "ask" && !lastMessage.partial

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					💬 Chat - {extensionState?.mode || "code"} mode
				</Text>
				{chatState.isStreaming && (
					<Box marginLeft={1}>
						<Spinner type="dots" />
						<Text color="yellow"> Thinking...</Text>
					</Box>
				)}
			</Box>

			{/* Messages area */}
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
				{chatState.messages.length === 0 ? (
					<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
						<Text color="gray">🤖 Welcome to Kilo Code CLI!</Text>
						<Text color="gray">Type your task or question and press Enter to start.</Text>
						<Text color="gray" dimColor>
							Press Enter to start typing, y/n to approve/reject actions
						</Text>
					</Box>
				) : (
					<Box flexDirection="column">
						{chatState.messages.slice(-10).map((message, index) => (
							<MessageRow key={message.ts} message={message} />
						))}
					</Box>
				)}
			</Box>

			{/* Input area */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				{inputMode === "input" ? (
					<Box>
						<Text color="blue">💭 </Text>
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
								<Text color="yellow">⚡ Action required:</Text>
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
		</Box>
	)
}

// Helper component for rendering individual messages
const MessageRow: React.FC<{ message: ClineMessage }> = ({ message }) => {
	const isUser = message.type === "ask" && message.ask === "followup"
	const isAssistant = message.type === "say" && message.say === "text"
	const isAction = message.type === "ask" && ["tool", "command", "browser_action_launch"].includes(message.ask || "")

	let icon = "🤖"
	let color = "white"

	if (isUser) {
		icon = "👤"
		color = "blue"
	} else if (isAction) {
		icon = "⚡"
		color = "yellow"
	}

	return (
		<Box marginBottom={1}>
			<Box marginRight={1}>
				<Text color={color}>{icon}</Text>
			</Box>
			<Box flexDirection="column" flexGrow={1}>
				<Text color={color}>{message.text || "No content"}</Text>
				{message.partial && (
					<Text color="gray" dimColor>
						<Spinner type="dots" /> Streaming...
					</Text>
				)}
			</Box>
		</Box>
	)
}
