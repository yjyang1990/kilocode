import React from "react"
import { render, Box, Text, useInput } from "ink"
import { EventEmitter } from "events"
import type { MessageBridge } from "../communication/ipc.js"
import type { ExtensionMessage } from "../types/messages.js"
import { ChatView } from "./components/pages/ChatView.js"
import { HistoryView } from "./components/pages/HistoryView.js"
import { SettingsIndex } from "./components/pages/SettingsIndex.js"
import { ProvidersView } from "./components/pages/ProvidersView.js"
import { AboutView } from "./components/pages/AboutView.js"
import { GenericSettingsView } from "./components/pages/GenericSettingsView.js"
import { ModesView } from "./components/pages/ModesView.js"
import { McpView } from "./components/pages/McpView.js"
import { LogsView } from "./components/pages/LogsView.js"
import { StatusBar } from "./components/layout/StatusBar.js"
import { OverlaySidebar } from "./components/generic/OverlaySidebar.js"
import { FullScreenLayout } from "./components/layout/FullScreenLayout.js"
import { logService } from "../services/LogService.js"
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
					logService.debug("ESC key pressed on nested route, going back", "CLI App")
					router.goBack()
				} else {
					logService.debug("ESC key pressed on root route, toggling sidebar", "CLI App")
					sidebar.toggle()
				}
				return
			}

			// Only process Ctrl key combinations when sidebar is not visible
			if (key.ctrl && !sidebar.visible) {
				logService.debug(`Ctrl key detected with input: "${input}"`, "CLI App")
				switch (input) {
					case "c":
						actions.exit()
						break
					case "q":
						actions.exit()
						break
					default:
						logService.debug(`Unhandled Ctrl+${input}`, "CLI App")
				}
				return // Consume the input when it's a Ctrl combination
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
		<CliContextProvider options={options}>
			<RouterProvider initialPath={initialPath}>
				<AppContent />
			</RouterProvider>
		</CliContextProvider>
	)
}

export class TUIApplication extends EventEmitter {
	private options: TUIApplicationOptions
	private renderInstance: any = null

	constructor(options: TUIApplicationOptions) {
		super()
		this.options = options
	}

	async startChatMode(): Promise<void> {
		this.renderInstance = render(<App options={this.options} />)

		// Wait for user to exit
		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async executeTask(message: string): Promise<void> {
		// For single task execution, we'll create a non-interactive mode
		logService.info(`Executing task: ${message}`, "TUIApplication")

		try {
			await this.options.messageBridge.sendWebviewMessage({
				type: "newTask",
				text: message,
			})

			// Wait for task completion or user interruption
			// This is a simplified implementation - in practice we'd need to handle
			// the full task lifecycle with proper state management
			logService.info("Task execution started. Press Ctrl+C to cancel.", "TUIApplication")
		} catch (error) {
			logService.error("Failed to execute task", "TUIApplication", { error })
			throw error
		}
	}

	async showHistory(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/history" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async showSettings(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/settings" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async showModes(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/modes" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async showMcp(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialPath: "/mcp" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	handleExtensionMessage(message: ExtensionMessage): void {
		this.emit("extensionMessage", message)
	}

	// Method to forward messages to the currently active view
	forwardMessageToActiveView(message: ExtensionMessage): void {
		// This could be enhanced to forward messages to the appropriate view
		// For now, we'll let the App component handle it through the callback
		logService.debug("Forwarding message to active view", "TUIApplication", { type: message.type })
	}

	async dispose(): Promise<void> {
		if (this.renderInstance) {
			this.renderInstance.unmount()
			this.renderInstance = null
		}
		this.removeAllListeners()
	}
}
