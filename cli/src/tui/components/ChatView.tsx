import React, { useState, useEffect, useCallback } from "react"
import { Box, Text, useInput } from "ink"
import TextInput from "ink-text-input"
import Spinner from "ink-spinner"
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

	// Handle extension messages
	useEffect(() => {
		const handleMessage = (message: ExtensionMessage) => {
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
				default:
					break
			}
		}

		// This would be connected to the message bridge in a real implementation
		// For now, we'll handle it through props
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
			console.error("Failed to send message:", error)
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
			console.error("Failed to approve:", error)
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
			console.error("Failed to reject:", error)
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
