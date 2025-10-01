/**
 * CommandUI - Main application component for command-based UI
 */

import React, { useEffect, useCallback } from "react"
import { Box, Text } from "ink"
import { Provider as JotaiProvider, useAtom, useAtomValue, useSetAtom } from "jotai"
import {
	messagesAtom,
	addMessageAtom,
	clearMessagesAtom,
	currentModeAtom,
	isProcessingAtom,
	errorAtom,
} from "../state/index.js"
import { MessageDisplay } from "./components/MessageDisplay.js"
import { CommandInput } from "./components/CommandInput.js"
import { initializeCommands, commandRegistry, parseCommand } from "../commands/index.js"
import { isCommandInput } from "../services/autocomplete.js"
import type { UIOptions, Message } from "../types/ui.js"
import type { CommandContext } from "../commands/core/types.js"

// Initialize commands on module load
initializeCommands()

interface UIAppProps {
	options: UIOptions
	onExit: () => void
}

const Content: React.FC<UIAppProps> = ({ options, onExit }) => {
	const messages = useAtomValue(messagesAtom)
	const addMessage = useSetAtom(addMessageAtom)
	const clearMessages = useSetAtom(clearMessagesAtom)
	const [currentMode, setCurrentMode] = useAtom(currentModeAtom)
	const [isProcessing, setIsProcessing] = useAtom(isProcessingAtom)
	const error = useAtomValue(errorAtom)

	// Initialize with welcome message
	useEffect(() => {
		addMessage({
			id: "welcome",
			type: "system",
			content: [
				"Welcome to Kilo Code CLI!",
				"",
				"Type a message to start chatting, or use /help to see available commands.",
				"Commands start with / (e.g., /help, /mode, /clear)",
			].join("\n"),
			timestamp: Date.now(),
		})
	}, [addMessage])

	const handleSubmit = useCallback(
		async (input: string) => {
			const trimmedInput = input.trim()
			if (!trimmedInput) return

			// Check if it's a command
			if (isCommandInput(trimmedInput)) {
				const parsed = parseCommand(trimmedInput)
				if (!parsed) {
					addMessage({
						id: Date.now().toString(),
						type: "error",
						content: "Invalid command format. Type /help for available commands.",
						timestamp: Date.now(),
					})
					return
				}

				const command = commandRegistry.get(parsed.command)
				if (!command) {
					addMessage({
						id: Date.now().toString(),
						type: "error",
						content: `Unknown command: /${parsed.command}. Type /help for available commands.`,
						timestamp: Date.now(),
					})
					return
				}

				// Execute command
				setIsProcessing(true)
				try {
					const context: CommandContext = {
						input: trimmedInput,
						args: parsed.args,
						options: parsed.options,
						sendMessage: async (message: any) => {
							await options.messageBridge.sendWebviewMessage(message)
						},
						addMessage: (message: Message) => {
							addMessage(message)
						},
						clearMessages: () => {
							clearMessages()
						},
						setMode: (mode: string) => {
							setCurrentMode(mode)
						},
						exit: () => {
							onExit()
						},
					}

					await command.handler(context)
				} catch (err) {
					addMessage({
						id: Date.now().toString(),
						type: "error",
						content: `Error executing command: ${err instanceof Error ? err.message : String(err)}`,
						timestamp: Date.now(),
					})
				} finally {
					setIsProcessing(false)
				}
			} else {
				// Regular message - send to extension
				addMessage({
					id: Date.now().toString(),
					type: "user",
					content: trimmedInput,
					timestamp: Date.now(),
				})

				setIsProcessing(true)
				try {
					await options.messageBridge.sendWebviewMessage({
						type: "newTask",
						text: trimmedInput,
					})
				} catch (err) {
					addMessage({
						id: Date.now().toString(),
						type: "error",
						content: `Error sending message: ${err instanceof Error ? err.message : String(err)}`,
						timestamp: Date.now(),
					})
				} finally {
					setIsProcessing(false)
				}
			}
		},
		[addMessage, clearMessages, setCurrentMode, setIsProcessing, options.messageBridge, onExit],
	)

	return (
		<Box flexDirection="column" height="100%">
			{/* Messages */}
			<Box flexGrow={1} flexDirection="column" overflow="hidden">
				<MessageDisplay messages={messages} />
			</Box>

			{/* Error display */}
			{error && (
				<Box borderStyle="single" borderColor="red" paddingX={1} marginY={1}>
					<Text color="red">⚠ {error}</Text>
				</Box>
			)}

			{/* Input */}
			<CommandInput onSubmit={handleSubmit} disabled={isProcessing} />
		</Box>
	)
}

export const UI: React.FC<UIAppProps> = (props) => {
	return (
		<JotaiProvider>
			<Content {...props} />
		</JotaiProvider>
	)
}
