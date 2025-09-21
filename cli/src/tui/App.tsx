import React, { useState, useEffect, useCallback } from "react"
import { render, Box, Text, useApp, useInput } from "ink"
import { EventEmitter } from "events"
import type { MessageBridge } from "../communication/ipc.js"
import type { ExtensionMessage, ExtensionState, WebviewMessage } from "../types/messages.js"
import { ChatView } from "./components/ChatView.js"
import { HistoryView } from "./components/HistoryView.js"
import { SettingsView } from "./components/SettingsView.js"
import { ModesView } from "./components/ModesView.js"
import { McpView } from "./components/McpView.js"
import { LogsView } from "./components/LogsView.js"
import { StatusBar } from "./components/StatusBar.js"
import { Navigation } from "./components/Navigation.js"
import { logService } from "../services/LogService.js"

export interface TUIApplicationOptions {
	messageBridge: MessageBridge
	initialMode: string
	workspace: string
	autoApprove: boolean
	initialView?: ViewType
}

type ViewType = "chat" | "history" | "settings" | "modes" | "mcp" | "logs"

interface AppState {
	currentView: ViewType
	extensionState: ExtensionState | null
	isLoading: boolean
	error: string | null
}

const App: React.FC<{ options: TUIApplicationOptions }> = ({ options }) => {
	const { exit } = useApp()
	const [state, setState] = useState<AppState>({
		currentView: options.initialView || "chat",
		extensionState: null,
		isLoading: true,
		error: null,
	})

	// Handle extension messages
	const handleExtensionMessage = useCallback(
		(message: ExtensionMessage) => {
			logService.info(`Received extension message: ${message.type}`, "CLI App")
			logService.debug(`Current isLoading state: ${state.isLoading}`, "CLI App")
			logService.debug(`Message state: ${message.state ? "present" : "null"}`, "CLI App")

			switch (message.type) {
				case "state":
					logService.debug("Processing state message, setting isLoading to false", "CLI App")
					setState((prev) => {
						logService.debug(
							`Previous state - isLoading: ${prev.isLoading}, extensionState: ${prev.extensionState ? "present" : "null"}`,
							"CLI App",
						)
						const newState = {
							...prev,
							extensionState: message.state || null,
							isLoading: false,
						}
						logService.debug(
							`New state - isLoading: ${newState.isLoading}, extensionState: ${newState.extensionState ? "present" : "null"}`,
							"CLI App",
						)
						return newState
					})
					break
				case "action":
					if (message.action === "chatButtonClicked") {
						setState((prev) => ({ ...prev, currentView: "chat" }))
					} else if (message.action === "historyButtonClicked") {
						setState((prev) => ({ ...prev, currentView: "history" }))
					} else if (message.action === "settingsButtonClicked") {
						setState((prev) => ({ ...prev, currentView: "settings" }))
					} else if (message.action === "promptsButtonClicked") {
						setState((prev) => ({ ...prev, currentView: "modes" }))
					} else if (message.action === "mcpButtonClicked") {
						setState((prev) => ({ ...prev, currentView: "mcp" }))
					}
					break
				case "messageUpdated":
					// Handle message updates like the webview does
					if (message.clineMessage && state.extensionState) {
						setState((prev) => {
							if (!prev.extensionState) return prev

							const lastIndex = prev.extensionState.clineMessages.findIndex(
								(msg) => msg.ts === message.clineMessage!.ts,
							)

							if (lastIndex !== -1) {
								const newClineMessages = [...prev.extensionState.clineMessages]
								newClineMessages[lastIndex] = message.clineMessage!
								return {
									...prev,
									extensionState: {
										...prev.extensionState,
										clineMessages: newClineMessages,
									},
								}
							} else {
								// Add new message
								return {
									...prev,
									extensionState: {
										...prev.extensionState,
										clineMessages: [...prev.extensionState.clineMessages, message.clineMessage!],
									},
								}
							}
						})
					}
					break
				default:
					logService.info(`Unhandled extension message: ${message.type}`, "CLI App")
					break
			}
		},
		[state.extensionState],
	)

	// Global keyboard shortcuts
	useInput((input, key) => {
		if (key.ctrl) {
			logService.debug(`Ctrl key detected with input: "${input}"`, "CLI App")
			switch (input) {
				case "c":
					exit()
					break
				case "q":
					exit()
					break
				case "w":
					setState((prev) => ({ ...prev, currentView: "chat" }))
					break
				case "e":
					setState((prev) => ({ ...prev, currentView: "history" }))
					break
				case "r":
					setState((prev) => ({ ...prev, currentView: "settings" }))
					break
				case "t":
					setState((prev) => ({ ...prev, currentView: "modes" }))
					break
				case "y":
					setState((prev) => ({ ...prev, currentView: "mcp" }))
					break
				case "l":
					setState((prev) => ({ ...prev, currentView: "logs" }))
					break
				default:
					logService.debug(`Unhandled Ctrl+${input}`, "CLI App")
			}
		}
	})

	// Initialize extension state and listen for messages
	useEffect(() => {
		const handleBridgeMessage = (message: any) => {
			if (message.data && message.data.type === "extensionMessage") {
				handleExtensionMessage(message.data.payload)
			}
		}

		// Listen for extension messages through the message bridge
		options.messageBridge.on("extensionEvent", handleBridgeMessage)

		// Request initial state
		const requestInitialState = async () => {
			try {
				await options.messageBridge.sendWebviewMessage({
					type: "webviewDidLaunch",
				})
			} catch (error) {
				logService.error("Failed to request initial state", "CLI App", { error })
				setState((prev) => ({
					...prev,
					error: "Failed to connect to extension",
					isLoading: false,
				}))
			}
		}

		requestInitialState()

		return () => {
			options.messageBridge.off("extensionEvent", handleBridgeMessage)
		}
	}, [options.messageBridge, handleExtensionMessage])

	const sendMessage = useCallback(
		async (message: WebviewMessage) => {
			try {
				await options.messageBridge.sendWebviewMessage(message)
			} catch (error) {
				logService.error("Failed to send message", "CLI App", { error })
			}
		},
		[options.messageBridge],
	)

	const switchView = useCallback(
		(view: ViewType) => {
			logService.debug(`Switching view from ${state.currentView} to ${view}`, "CLI App")
			setState((prev) => ({ ...prev, currentView: view }))
		},
		[state.currentView],
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

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					🤖 Kilo Code CLI - {state.extensionState?.version || "1.0.0"}
				</Text>
			</Box>

			{/* Navigation */}
			<Navigation currentView={state.currentView} onViewChange={switchView} />

			{/* Main content area */}
			<Box flexGrow={1} flexDirection="column">
				{state.currentView === "chat" && (
					<ChatView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onExtensionMessage={handleExtensionMessage}
					/>
				)}
				{state.currentView === "history" && (
					<HistoryView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
					/>
				)}
				{state.currentView === "settings" && (
					<SettingsView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
					/>
				)}
				{state.currentView === "modes" && (
					<ModesView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
					/>
				)}
				{state.currentView === "mcp" && (
					<McpView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
					/>
				)}
				{state.currentView === "logs" && (
					<LogsView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
					/>
				)}
			</Box>

			{/* Status bar */}
			<StatusBar extensionState={state.extensionState} workspace={options.workspace || process.cwd()} />
		</Box>
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
		this.renderInstance = render(<App options={{ ...this.options, initialView: "history" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async showSettings(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialView: "settings" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async showModes(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialView: "modes" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	async showMcp(): Promise<void> {
		this.renderInstance = render(<App options={{ ...this.options, initialView: "mcp" }} />)

		return new Promise<void>((resolve) => {
			this.renderInstance.waitUntilExit().then(() => {
				resolve()
			})
		})
	}

	handleExtensionMessage(message: ExtensionMessage): void {
		this.emit("extensionMessage", message)
	}

	async dispose(): Promise<void> {
		if (this.renderInstance) {
			this.renderInstance.unmount()
			this.renderInstance = null
		}
		this.removeAllListeners()
	}
}
