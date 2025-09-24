// Main context exports
export { CliContextProvider, useCliContext } from "./CliContext.js"

// Hook exports
export { useCliState } from "./hooks/useCliState.js"
export { useCliActions } from "./hooks/useCliActions.js"
export { useExtensionState } from "./hooks/useExtensionState.js"
export { useCurrentView } from "./hooks/useCurrentView.js"
export { useSidebar } from "./hooks/useSidebar.js"
export { useExtensionMessage } from "./hooks/useExtensionMessage.js"
export { useViewNavigation } from "./hooks/useViewNavigation.js"

// Type exports
export type {
	ViewType,
	TUIApplicationOptions,
	CliState,
	CliActions,
	CliContextValue,
	UseSidebarReturn,
	UseCurrentViewReturn,
	UseExtensionMessageReturn,
	UseViewNavigationReturn,
} from "./types.js"
