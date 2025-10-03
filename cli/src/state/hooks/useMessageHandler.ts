/**
 * Hook for handling regular (non-command) message sending
 * Provides a clean interface for sending user messages to the extension
 */

import { useSetAtom } from "jotai"
import { useCallback, useState } from "react"
import { addMessageAtom, isProcessingAtom } from "../atoms/ui.js"
import { useWebviewMessage } from "./useWebviewMessage.js"
import type { CliMessage } from "../../types/cli.js"
import { logs } from "../../services/logs.js"

/**
 * Options for useMessageHandler hook
 */
export interface UseMessageHandlerOptions {
	/** Whether CI mode is active */
	ciMode?: boolean
}

/**
 * Return type for useMessageHandler hook
 */
export interface UseMessageHandlerReturn {
	/** Send a user message to the extension */
	sendUserMessage: (text: string) => Promise<void>
	/** Whether a message is currently being sent */
	isSending: boolean
}

/**
 * Hook that provides message sending functionality
 *
 * This hook handles sending regular user messages (non-commands) to the extension,
 * including adding the message to the UI and handling errors.
 *
 * @example
 * ```tsx
 * function ChatInput() {
 *   const { sendUserMessage, isSending } = useMessageHandler()
 *
 *   const handleSubmit = async (input: string) => {
 *     await sendUserMessage(input)
 *   }
 *
 *   return (
 *     <input
 *       onSubmit={handleSubmit}
 *       disabled={isSending}
 *     />
 *   )
 * }
 * ```
 */
export function useMessageHandler(options: UseMessageHandlerOptions = {}): UseMessageHandlerReturn {
	const { ciMode = false } = options
	const [isSending, setIsSending] = useState(false)
	const addMessage = useSetAtom(addMessageAtom)
	const setIsProcessing = useSetAtom(isProcessingAtom)
	const { sendMessage } = useWebviewMessage()

	const sendUserMessage = useCallback(
		async (text: string): Promise<void> => {
			const trimmedText = text.trim()

			if (!trimmedText) {
				return
			}

			// Add user message to the UI
			const userMessage: CliMessage = {
				id: Date.now().toString(),
				type: "user",
				content: trimmedText,
				ts: Date.now(),
			}
			addMessage(userMessage)

			// Set processing state
			setIsSending(true)
			setIsProcessing(true)

			try {
				// Send message to extension
				await sendMessage({
					type: "newTask",
					text: trimmedText,
				})
			} catch (error) {
				// Add error message if sending failed
				const errorMessage: CliMessage = {
					id: Date.now().toString(),
					type: "error",
					content: `Error sending message: ${error instanceof Error ? error.message : String(error)}`,
					ts: Date.now(),
				}
				addMessage(errorMessage)
			} finally {
				// Reset sending state
				setIsSending(false)

				// In CI mode, keep isProcessing true until we receive completion_result
				// In interactive mode, reset immediately
				if (!ciMode) {
					setIsProcessing(false)
					logs.debug("Message sent, processing state reset (interactive mode)", "useMessageHandler")
				} else {
					logs.debug("Message sent, keeping processing state active (CI mode)", "useMessageHandler")
					// isProcessing will be reset when completion_result is received
				}
			}
		},
		[addMessage, setIsProcessing, ciMode, sendMessage],
	)

	return {
		sendUserMessage,
		isSending,
	}
}
