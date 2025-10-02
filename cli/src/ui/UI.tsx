/**
 * CommandUI - Main application component for command-based UI
 * Updated to use new hooks-based architecture with ExtensionService
 */

import React, { useEffect, useCallback } from "react"
import { Box, Text } from "ink"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
	messagesAtom,
	addMessageAtom,
	clearMessagesAtom,
	currentModeAtom,
	isProcessingAtom,
	errorAtom,
} from "../state/atoms/ui.js"
import { MessageDisplay } from "./messages/MessageDisplay.js"
import { CommandInput } from "./components/CommandInput.js"
import { initializeCommands, commandRegistry, parseCommand } from "../commands/index.js"
import { isCommandInput } from "../services/autocomplete.js"
import { useWebviewMessage } from "../state/hooks/useWebviewMessage.js"
import type { CliMessage } from "../types/cli.js"
import type { CommandContext } from "../commands/core/types.js"

// Initialize commands on module load
initializeCommands()

export interface UIOptions {
	initialMode?: string
	workspace?: string
	autoApprove?: boolean
}

interface UIAppProps {
	options: UIOptions
	onExit: () => void
}

export const UI: React.FC<UIAppProps> = ({ options, onExit }) => {
	const messages = useAtomValue(messagesAtom)
	const addMessage = useSetAtom(addMessageAtom)
	const clearMessages = useSetAtom(clearMessagesAtom)
	const [currentMode, setCurrentMode] = useAtom(currentModeAtom)
	const [isProcessing, setIsProcessing] = useAtom(isProcessingAtom)
	const error = useAtomValue(errorAtom)

	// Use the new webview message hook
	const { sendMessage } = useWebviewMessage()

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
			ts: Date.now(),
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
						ts: Date.now(),
					})
					return
				}

				const command = commandRegistry.get(parsed.command)
				if (!command) {
					addMessage({
						id: Date.now().toString(),
						type: "error",
						content: `Unknown command: /${parsed.command}. Type /help for available commands.`,
						ts: Date.now(),
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
							await sendMessage(message)
						},
						addMessage: (message: CliMessage) => {
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
						ts: Date.now(),
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
					ts: Date.now(),
				})

				setIsProcessing(true)
				try {
					await sendMessage({
						type: "newTask",
						text: trimmedInput,
					})
				} catch (err) {
					addMessage({
						id: Date.now().toString(),
						type: "error",
						content: `Error sending message: ${err instanceof Error ? err.message : String(err)}`,
						ts: Date.now(),
					})
				} finally {
					setIsProcessing(false)
				}
			}
		},
		[addMessage, clearMessages, setCurrentMode, setIsProcessing, sendMessage, onExit],
	)

	return (
		<Box flexDirection="column" height="100%">
			{/* Messages */}
			<Box flexGrow={1} flexDirection="column" overflow="hidden">
				<MessageDisplay />
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
