import { useCliContext } from "../CliContext.js"
import type { UseCurrentViewReturn } from "../types.js"

/**
 * Hook to access and manage the current view
 * @returns Object with current view and switch function
 */
export const useCurrentView = (): UseCurrentViewReturn => {
	const { state, actions } = useCliContext()

	return {
		currentView: state.currentView,
		switchView: actions.switchView,
	}
}
