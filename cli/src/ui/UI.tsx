/**
 * CommandUI - Main application component for command-based UI
 * Refactored to use specialized hooks for better maintainability
 */

import React, { useCallback } from "react"
import { Box, Text } from "ink"
import { useAtomValue } from "jotai"
import { isProcessingAtom, errorAtom } from "../state/atoms/ui.js"
import { MessageDisplay } from "./messages/MessageDisplay.js"
import { CommandInput } from "./components/CommandInput.js"
import { initializeCommands } from "../commands/index.js"
import { isCommandInput } from "../services/autocomplete.js"
import { useCommandHandler } from "../state/hooks/useCommandHandler.js"
import { useMessageHandler } from "../state/hooks/useMessageHandler.js"
import { useWelcomeMessage } from "../state/hooks/useWelcomeMessage.js"

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
	const isProcessing = useAtomValue(isProcessingAtom)
	const error = useAtomValue(errorAtom)

	// Use specialized hooks for command and message handling
	const { executeCommand, isExecuting: isExecutingCommand } = useCommandHandler()
	const { sendUserMessage, isSending: isSendingMessage } = useMessageHandler()

	// Display welcome message on mount
	useWelcomeMessage()

	// Simplified submit handler that delegates to appropriate hook
	const handleSubmit = useCallback(
		async (input: string) => {
			const trimmedInput = input.trim()
			if (!trimmedInput) return

			// Determine if it's a command or regular message
			if (isCommandInput(trimmedInput)) {
				// Handle as command
				await executeCommand(trimmedInput, onExit)
			} else {
				// Handle as regular message
				await sendUserMessage(trimmedInput)
			}
		},
		[executeCommand, sendUserMessage, onExit],
	)

	// Determine if any operation is in progress
	const isAnyOperationInProgress = isProcessing || isExecutingCommand || isSendingMessage

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
			<CommandInput onSubmit={handleSubmit} disabled={isAnyOperationInProgress} />
		</Box>
	)
}
