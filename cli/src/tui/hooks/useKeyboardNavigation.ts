import { useInput } from "ink"
import type { UseKeyboardNavigationProps } from "../types/components.js"
import { useSidebar } from "../context/index.js"

/**
 * Custom hook for handling common keyboard navigation patterns
 * Provides consistent keyboard handling across page components
 * Now integrates with CLI context for sidebar state
 */
export const useKeyboardNavigation = ({
	sidebarVisible,
	onEscape,
	customHandlers = {},
	isActive = true,
}: UseKeyboardNavigationProps) => {
	// Get sidebar state from context if not provided as prop
	const contextSidebar = useSidebar()
	const actualSidebarVisible = sidebarVisible !== undefined ? sidebarVisible : contextSidebar.visible
	const actualOnEscape = onEscape || contextSidebar.toggle
	useInput(
		(input, key) => {
			// Don't handle input when sidebar is visible (unless specifically handled)
			if (actualSidebarVisible && !customHandlers.sidebarVisible) {
				return
			}

			// Handle escape key
			if (key.escape && actualOnEscape) {
				actualOnEscape()
				return
			}

			// Handle custom key combinations
			const handlerKey = key.ctrl ? `ctrl+${input}` : input
			const handler = customHandlers[handlerKey]
			if (handler) {
				handler(input, key)
				return
			}

			// Handle arrow keys if custom handler exists
			if (key.upArrow && customHandlers.upArrow) {
				customHandlers.upArrow(input, key)
				return
			}
			if (key.downArrow && customHandlers.downArrow) {
				customHandlers.downArrow(input, key)
				return
			}
			if (key.leftArrow && customHandlers.leftArrow) {
				customHandlers.leftArrow(input, key)
				return
			}
			if (key.rightArrow && customHandlers.rightArrow) {
				customHandlers.rightArrow(input, key)
				return
			}

			// Handle return key
			if (key.return && customHandlers.return) {
				customHandlers.return(input, key)
				return
			}

			// Handle tab key
			if (key.tab && customHandlers.tab) {
				customHandlers.tab(input, key)
				return
			}
		},
		{ isActive },
	)
}
