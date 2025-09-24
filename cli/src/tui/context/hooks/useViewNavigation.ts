import { useCallback } from "react"
import { useCliContext } from "../CliContext.js"
import type { UseViewNavigationReturn, ViewType } from "../types.js"

/**
 * Hook for enhanced view navigation with smart back functionality
 * @returns Object with navigation utilities
 */
export const useViewNavigation = (): UseViewNavigationReturn => {
	const { state, actions } = useCliContext()

	// Smart back navigation - goes to chat by default, but could be enhanced
	// to maintain a view history stack in the future
	const goBack = useCallback(() => {
		// For now, always go back to chat
		// In the future, this could maintain a navigation stack
		actions.switchView("chat")
	}, [actions])

	return {
		currentView: state.currentView,
		switchView: actions.switchView,
		goBack,
	}
}
