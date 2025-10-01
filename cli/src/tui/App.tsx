import React from "react"
import { render, Box, useInput } from "ink"
import { Text } from "./components/common/Text.js"
import { Provider as JotaiProvider } from "jotai"
import { EventEmitter } from "events"
import type { ExtensionMessage } from "../types/messages.js"
import { ChatView } from "./components/pages/chat/ChatView.js"
import { HistoryView } from "./components/pages/HistoryView.js"
import { SettingsIndex } from "./components/pages/SettingsIndex.js"
import { ProvidersView } from "./components/pages/settings/providers/ProvidersView.js"
import {
	CreateProviderPage,
	EditProviderPage,
	ChooseProviderPage,
	ChooseModelPage,
	RemoveProviderPage,
	EditFieldPage,
} from "./components/pages/settings/providers/pages/index.js"
import { AboutView } from "./components/pages/settings/about/AboutView.js"
import { GenericSettingsView } from "./components/pages/GenericSettingsView.js"
import { ModesView } from "./components/pages/ModesView.js"
import { McpView } from "./components/pages/McpView.js"
import { LogsView } from "./components/pages/LogsView.js"
import { StatusBar } from "./components/layout/StatusBar.js"
import { OverlaySidebar } from "./components/generic/OverlaySidebar.js"
import { FullScreenLayout } from "./components/layout/FullScreenLayout.js"
import { logs } from "../services/logs.js"
import {
	CliContextProvider,
	useCliState,
	useCliActions,
	useSidebar,
	type TUIApplicationOptions,
} from "./context/index.js"
import { RouterProvider, Routes, Route, useNavigate, Navigate, useRouter } from "./router/index.js"

// Inner App component that uses context and router
const AppContent: React.FC = () => {
	const state = useCliState()
	const actions = useCliActions()
	const sidebar = useSidebar()
	const router = useRouter()

	// Global keyboard shortcuts - handle escape key and Ctrl combinations
	useInput(
		(input, key) => {
			// Handle escape key - toggle sidebar for root routes, go back for nested routes
			if (key.escape) {
				// Check if current route has a parent (contains more than one slash after the first one)
				const pathSegments = router.currentPath.split("/").filter((segment) => segment !== "")
				const hasParent = pathSegments.length > 1

				if (hasParent && router.canGoBack) {
					logs.debug("ESC key pressed on nested route, going back", "CLI App")
					router.goBack()
				} else {
					logs.debug("ESC key pressed on root route, toggling sidebar", "CLI App")
					sidebar.toggle()
				}
				return
			}

			// Process Ctrl key combinations regardless of sidebar visibility for exit commands
			if (key.ctrl) {
				logs.debug(`Ctrl key detected with input: "${input}"`, "CLI App")
				switch (input) {
					case "c":
						actions.exit()
						return
					case "q":
						actions.exit()
						return
					default:
						// Only consume other Ctrl combinations when sidebar is not visible
						if (!sidebar.visible) {
							logs.debug(`Unhandled Ctrl+${input}`, "CLI App")
							return
						}
				}
			}
			// For non-Ctrl input, don't consume it - let child components handle it
		},
		{
			isActive: true,
		},
	)

	if (state.isLoading) {
		return (
			<Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
				<Text color="blue">🚀 Initializing Kilo Code CLI...</Text>
				<Text color="gray">Loading extension and connecting to backend...</Text>
			</Box>
		)
	}

	if (state.error) {
		return (
			<Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
				<Text color="red">❌ Error: {state.error}</Text>
				<Text color="gray">Press Ctrl+C to exit</Text>
			</Box>
		)
	}

	// Router handles content rendering now

	return (
		<FullScreenLayout>
			<Box flexDirection="column" height="100%">
				{/* Main content area with sidebar */}
				<Box flexDirection="row" flexGrow={1}>
					{/* Sidebar - Shows as a side panel when visible */}
					{sidebar.visible && (
						<OverlaySidebar
							isVisible={sidebar.visible}
							onSelectItem={sidebar.handleSelect}
							onClose={sidebar.close}
						/>
					)}

					{/* Main content area - takes up remaining space */}
					<Box flexGrow={1} flexDirection="column">
						<Routes>
							<Route path="/chat" component={ChatView} exact />
							<Route path="/chat/:conversationId" component={ChatView} />
							<Route path="/history" component={HistoryView} exact />
							<Route path="/history/:taskId" component={HistoryView} />
							<Route path="/settings" component={SettingsIndex} exact />
							<Route path="/settings/providers" component={ProvidersView} exact />
							<Route path="/settings/providers/create" component={CreateProviderPage} exact />
							<Route path="/settings/providers/edit" component={EditProviderPage} exact />
							<Route path="/settings/providers/choose" component={ChooseProviderPage} exact />
							<Route path="/settings/providers/choose-model" component={ChooseModelPage} exact />
							<Route path="/settings/providers/remove" component={RemoveProviderPage} exact />
							<Route path="/settings/providers/field/:field" component={EditFieldPage} exact />
							<Route path="/settings/about" component={AboutView} exact />
							<Route
								path="/settings/auto-approve"
								component={() => <GenericSettingsView section="auto-approve" title="Auto-Approve" />}
								exact
							/>
							<Route
								path="/settings/browser"
								component={() => <GenericSettingsView section="browser" title="Browser" />}
								exact
							/>
							<Route
								path="/settings/checkpoints"
								component={() => <GenericSettingsView section="checkpoints" title="Checkpoints" />}
								exact
							/>
							<Route
								path="/settings/display"
								component={() => <GenericSettingsView section="display" title="Display" />}
								exact
							/>
							<Route
								path="/settings/notifications"
								component={() => <GenericSettingsView section="notifications" title="Notifications" />}
								exact
							/>
							<Route
								path="/settings/context"
								component={() => <GenericSettingsView section="context" title="Context" />}
								exact
							/>
							<Route
								path="/settings/terminal"
								component={() => <GenericSettingsView section="terminal" title="Terminal" />}
								exact
							/>
							<Route
								path="/settings/prompts"
								component={() => <GenericSettingsView section="prompts" title="Prompts" />}
								exact
							/>
							<Route
								path="/settings/experimental"
								component={() => <GenericSettingsView section="experimental" title="Experimental" />}
								exact
							/>
							<Route
								path="/settings/language"
								component={() => <GenericSettingsView section="language" title="Language" />}
								exact
							/>
							<Route
								path="/settings/mcp-servers"
								component={() => <GenericSettingsView section="mcp-servers" title="MCP Servers" />}
								exact
							/>
							<Route path="/modes" component={ModesView} exact />
							<Route path="/modes/:modeId" component={ModesView} />
							<Route path="/mcp" component={McpView} exact />
							<Route path="/logs" component={LogsView} exact />
						</Routes>
					</Box>
				</Box>

				{/* Status bar - always at bottom */}
				<StatusBar />
			</Box>
		</FullScreenLayout>
	)
}

// Main App component that wraps everything with context and router
const App: React.FC<{ options: TUIApplicationOptions }> = ({ options }) => {
	const initialPath = options.initialPath || "/chat"

	return (
		<JotaiProvider>
			<CliContextProvider options={options}>
				<RouterProvider initialPath={initialPath}>
					<AppContent />
				</RouterProvider>
			</CliContextProvider>
		</JotaiProvider>
	)
}

export class TUIApplication extends EventEmitter {
	private options: TUIApplicationOptions
	private renderInstance: any = null

	constructor(options: TUIApplicationOptions) {
		super()
		this.options = options
	}

	handleExtensionMessage(message: ExtensionMessage): void {
		this.emit("extensionMessage", message)
	}

	// Method to forward messages to the currently active view
	forwardMessageToActiveView(message: ExtensionMessage): void {
		// This could be enhanced to forward messages to the appropriate view
		// For now, we'll let the App component handle it through the callback
		logs.debug("Forwarding message to active view", "TUIApplication", { type: message.type })
	}

	async dispose(): Promise<void> {
		if (this.renderInstance) {
			this.renderInstance.unmount()
			this.renderInstance = null
		}
		this.removeAllListeners()
	}

	async waitManualExit(): Promise<void> {
		await this.renderInstance.waitUntilExit()
		await this.dispose()
	}

	async startChatMode(): Promise<void> {
		this.renderInstance = render(<App options={this.options} />)
		return this.waitManualExit()
	}

	async executeTask(message: string): Promise<void> {
		// For single task execution, we'll create a non-interactive mode
		logs.info(`Executing task: ${message}`, "TUIApplication")

		try {
			await this.options.messageBridge.sendWebviewMessage({
				type: "newTask",
				text: message,
			})

			// Wait for task completion or user interruption
			// This is a simplified implementation - in practice we'd need to handle
			// the full task lifecycle with proper state management
			logs.info("Task execution started. Press Ctrl+C to cancel.", "TUIApplication")
		} catch (error) {
			logs.error("Failed to execute task", "TUIApplication", { error })
			throw error
		}
	}

	async showHistory(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/history" }} />)
		return this.waitManualExit()
	}

	async showSettings(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/settings" }} />)
		return this.waitManualExit()
	}

	async showModes(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/modes" }} />)
		return this.waitManualExit()
	}

	async showMcp(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/mcp" }} />)
		return this.waitManualExit()
	}
}
