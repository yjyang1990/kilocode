import { useCliContext } from "../CliContext.js"
import type { UseSidebarReturn } from "../types.js"

/**
 * Hook to access and manage sidebar state
 * @returns Object with sidebar state and management functions
 */
export const useSidebar = (): UseSidebarReturn => {
	const { state, actions } = useCliContext()

	return {
		visible: state.sidebarVisible,
		toggle: actions.toggleSidebar,
		close: actions.closeSidebar,
		handleSelect: actions.handleSidebarSelect,
	}
}
