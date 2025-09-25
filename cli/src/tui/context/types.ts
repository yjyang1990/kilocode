import type { ExtensionMessage, ExtensionState, WebviewMessage, RouterModels } from "../../types/messages.js"
import type { MessageBridge } from "../../communication/ipc.js"

// ViewType removed - now using router paths instead

export interface TUIApplicationOptions {
	messageBridge: MessageBridge
	initialMode: string
	workspace: string
	autoApprove: boolean
	initialPath?: string
}

export interface CliState {
	// App State
	extensionState: ExtensionState | null
	isLoading: boolean
	error: string | null
	lastExtensionMessage: ExtensionMessage | null

	// Model Management
	routerModels: RouterModels | null
	isLoadingModels: boolean
	modelLoadingError: string | null

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

	// State Management
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void

	// Model Management
	requestRouterModels: () => Promise<void>
	setRouterModels: (models: RouterModels | null) => void
	setModelLoadingState: (loading: boolean) => void
	setModelLoadingError: (error: string | null) => void

	// App Control
	exit: () => void
}

export interface CliContextValue {
	state: CliState
	actions: CliActions
}

// UseCurrentViewReturn removed - replaced by router hooks

export interface UseExtensionMessageReturn {
	sendMessage: (message: WebviewMessage) => Promise<void>
	lastMessage: ExtensionMessage | null
	handleMessage: (message: ExtensionMessage) => void
	requestRouterModels: () => Promise<void>
}

// UseViewNavigationReturn removed - replaced by router hooks
