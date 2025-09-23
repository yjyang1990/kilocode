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
	const getMessageDisplay = () => {
		if (message.type === "say") {
			switch (message.say) {
				case "user_feedback":
					return {
						icon: "👤",
						color: "blue",
						text: message.text || "User message",
						label: "You",
					}
				case "text":
					return {
						icon: "🤖",
						color: "white",
						text: message.text || "AI response",
						label: "Assistant",
					}
				case "api_req_started":
					const apiInfo = message.text ? JSON.parse(message.text) : {}
					const isProcessing = message.partial || !apiInfo.cost
					return {
						icon: isProcessing ? "⚡" : "✅",
						color: isProcessing ? "yellow" : "green",
						text: isProcessing ? "Thinking..." : `Request completed (cost: $${apiInfo.cost || 0})`,
						label: "System",
					}
				case "error":
					return {
						icon: "❌",
						color: "red",
						text: message.text || "An error occurred",
						label: "Error",
					}
				default:
					return {
						icon: "🤖",
						color: "white",
						text: message.text || "Processing...",
						label: "System",
					}
			}
		} else if (message.type === "ask") {
			switch (message.ask) {
				case "followup":
					return {
						icon: "❓",
						color: "cyan",
						text: message.text || "Question",
						label: "Question",
					}
				case "tool":
				case "command":
				case "browser_action_launch":
					return {
						icon: "⚡",
						color: "yellow",
						text: message.text || "Action required",
						label: "Action",
					}
				case "completion_result":
					return {
						icon: "✅",
						color: "green",
						text: message.text || "Task completed",
						label: "Completed",
					}
				default:
					return {
						icon: "❓",
						color: "cyan",
						text: message.text || "Question",
						label: "Question",
					}
			}
		}

		return {
			icon: "🤖",
			color: "white",
			text: message.text || "No content",
			label: "Unknown",
		}
	}

	const { icon, color, text, label } = getMessageDisplay()

	return (
		<Box marginBottom={1}>
			<Box marginRight={1} minWidth={3}>
				<Text color={color}>{icon}</Text>
			</Box>
			<Box flexDirection="column" flexGrow={1}>
				<Box marginBottom={0}>
					<Text color={color} bold>
						{label}:
					</Text>
				</Box>
				<Text color={color}>{text}</Text>
				{message.partial && (
					<Box marginTop={0}>
						<Text color="gray" dimColor>
							<Spinner type="dots" /> Streaming...
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
