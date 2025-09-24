import { useCliContext } from "../CliContext.js"
import type { ExtensionState } from "../../../types/messages.js"

/**
 * Hook to access the extension state
 * @returns The current extension state or null if not loaded
 */
export const useExtensionState = (): ExtensionState | null => {
	const { state } = useCliContext()
	return state.extensionState
}
