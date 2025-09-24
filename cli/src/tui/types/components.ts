import type { ExtensionState, WebviewMessage } from "../../types/messages.js"

// Legacy base props - kept for backward compatibility during migration
// These will be removed once all components are migrated to context
export interface BasePageProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	sidebarVisible?: boolean
}

// Legacy navigable props - kept for backward compatibility during migration
export interface NavigablePageProps extends BasePageProps {
	onBack: () => void
}

// New context-based props for components that use context
export interface ContextPageProps {
	// No props needed - components will use context hooks directly
}

// New context-based navigable props
export interface ContextNavigablePageProps extends ContextPageProps {
	// Components will use useViewNavigation hook for navigation
}

// Props for the reusable PageHeader component
export interface PageHeaderProps {
	title: string
	subtitle?: string
	icon?: string
	color?: "blue" | "green" | "yellow" | "red" | "cyan" | "magenta" | "white" | "gray"
	badge?: string
	actions?: React.ReactNode
	borderColor?: string
}

// Props for the reusable PageFooter component
export interface PageFooterProps {
	actions: Array<{
		key: string
		label: string
		color?: string
		description?: string
	}>
	borderColor?: string
}

// Props for the reusable EmptyState component
export interface EmptyStateProps {
	icon: string
	title: string
	description?: string | string[]
	isLoading?: boolean
	loadingText?: string
	actions?: React.ReactNode
}

// Props for the PageLayout component
export interface PageLayoutProps {
	header?: React.ReactNode
	footer?: React.ReactNode
	children: React.ReactNode
	sidebarVisible?: boolean
	scrollable?: boolean
}

// Props for keyboard navigation hook
export interface UseKeyboardNavigationProps {
	sidebarVisible: boolean
	onEscape?: () => void
	customHandlers?: Record<string, (input: string, key: any) => void>
	isActive?: boolean
}

// Props for page state hook
export interface UsePageStateProps<T> {
	initialState: T
	extensionState: ExtensionState | null
	dependencies?: any[]
}
