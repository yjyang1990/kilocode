import { useCliContext } from "../CliContext.js"
import type { UseExtensionMessageReturn } from "../types.js"

/**
 * Hook to access extension message handling utilities
 * @returns Object with message handling functions and last message
 */
export const useExtensionMessage = (): UseExtensionMessageReturn => {
	const { state, actions } = useCliContext()

	return {
		sendMessage: actions.sendMessage,
		lastMessage: state.lastExtensionMessage,
		handleMessage: actions.handleExtensionMessage,
	}
}
