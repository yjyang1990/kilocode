import type { ExtensionMessage, ExtensionState, WebviewMessage } from "../../types/messages.js"
import type { MessageBridge } from "../../communication/ipc.js"

export type ViewType = "chat" | "history" | "settings" | "modes" | "mcp" | "logs"

export interface TUIApplicationOptions {
	messageBridge: MessageBridge
	initialMode: string
	workspace: string
	autoApprove: boolean
	initialView?: ViewType
}

export interface CliState {
	// App State
	currentView: ViewType
	extensionState: ExtensionState | null
	isLoading: boolean
	error: string | null
	lastExtensionMessage: ExtensionMessage | null
	sidebarVisible: boolean

	// Application Options
	workspace: string
	autoApprove: boolean
	initialMode: string
	messageBridge: MessageBridge
}

export interface CliActions {
	// Message Handling
	sendMessage: (message: WebviewMessage) => Promise<void>
	handleExtensionMessage: (message: ExtensionMessage) => void

	// Navigation
	switchView: (view: ViewType) => void

	// Sidebar Management
	toggleSidebar: () => void
	closeSidebar: () => void
	handleSidebarSelect: (item: ViewType | "profile" | "exit") => void

	// State Management
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void

	// App Control
	exit: () => void
}

export interface CliContextValue {
	state: CliState
	actions: CliActions
}

// Hook return types
export interface UseSidebarReturn {
	visible: boolean
	toggle: () => void
	close: () => void
	handleSelect: (item: ViewType | "profile" | "exit") => void
}

export interface UseCurrentViewReturn {
	currentView: ViewType
	switchView: (view: ViewType) => void
}

export interface UseExtensionMessageReturn {
	sendMessage: (message: WebviewMessage) => Promise<void>
	lastMessage: ExtensionMessage | null
	handleMessage: (message: ExtensionMessage) => void
}

export interface UseViewNavigationReturn {
	currentView: ViewType
	switchView: (view: ViewType) => void
	goBack: () => void
}
