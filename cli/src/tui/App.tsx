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
import { OverlaySidebar } from "./components/OverlaySidebar.js"
import { FullScreenLayout } from "./components/FullScreenLayout.js"
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
	lastExtensionMessage: ExtensionMessage | null
	sidebarVisible: boolean
}

const App: React.FC<{ options: TUIApplicationOptions }> = ({ options }) => {
	const { exit } = useApp()
	const [state, setState] = useState<AppState>({
		currentView: options.initialView || "chat",
		extensionState: null,
		isLoading: true,
		error: null,
		lastExtensionMessage: null,
		sidebarVisible: false,
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
						logService.debug(`Updating message with ts: ${message.clineMessage.ts}`, "CLI App")
						setState((prev) => {
							if (!prev.extensionState) return prev

							const lastIndex = prev.extensionState.clineMessages.findIndex(
								(msg) => msg.ts === message.clineMessage!.ts,
							)

							if (lastIndex !== -1) {
								const newClineMessages = [...prev.extensionState.clineMessages]
								newClineMessages[lastIndex] = message.clineMessage!
								logService.debug(`Updated existing message at index ${lastIndex}`, "CLI App")
								return {
									...prev,
									extensionState: {
										...prev.extensionState,
										clineMessages: newClineMessages,
									},
								}
							} else {
								// Add new message
								logService.debug(`Adding new message with ts: ${message.clineMessage!.ts}`, "CLI App")
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
				case "selectedImages":
					// Handle image selection messages
					logService.debug("Received selectedImages message", "CLI App", { images: message.images })
					// For CLI, we might want to handle this differently or pass it to the active view
					break
				case "invoke":
					// Handle invoke messages that trigger specific actions
					logService.debug(`Received invoke message: ${message.invoke}`, "CLI App")
					switch (message.invoke) {
						case "newChat":
							// Reset chat state
							setState((prev) => ({
								...prev,
								extensionState: prev.extensionState
									? {
											...prev.extensionState,
											clineMessages: [],
										}
									: null,
							}))
							break
						case "sendMessage":
							// This would be handled by the ChatView component
							logService.debug("Invoke sendMessage received", "CLI App")
							break
						case "setChatBoxMessage":
							// This would be handled by the ChatView component
							logService.debug("Invoke setChatBoxMessage received", "CLI App")
							break
						case "primaryButtonClick":
						case "secondaryButtonClick":
							// These would be handled by the ChatView component
							logService.debug(`Invoke ${message.invoke} received`, "CLI App")
							break
						default:
							logService.debug(`Unhandled invoke: ${message.invoke}`, "CLI App")
							break
					}
					break
				case "condenseTaskContextResponse":
					// Handle context condensing response
					logService.debug("Received condenseTaskContextResponse", "CLI App")
					if (message.text && state.extensionState?.currentTaskItem?.id === message.text) {
						// Update state to reflect condensing completion
						setState((prev) => ({
							...prev,
							// Could add a flag to indicate condensing is complete
						}))
					}
					break
				case "taskHistoryResponse":
					// Handle task history response
					logService.debug("Received taskHistoryResponse", "CLI App")
					// Store the message so it can be passed to the HistoryView
					setState((prev) => ({
						...prev,
						lastExtensionMessage: message,
					}))
					break
				default:
					logService.info(`Unhandled extension message: ${message.type}`, "CLI App")
					break
			}
		},
		[state.extensionState],
	)

	// Global keyboard shortcuts - handle escape key and Ctrl combinations
	useInput(
		(input, key) => {
			// Handle escape key to toggle sidebar
			if (key.escape) {
				logService.debug("ESC key pressed, toggling sidebar", "CLI App")
				setState((prev) => ({ ...prev, sidebarVisible: !prev.sidebarVisible }))
				return
			}

			// Only process Ctrl key combinations when sidebar is not visible
			if (key.ctrl && !state.sidebarVisible) {
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
				return // Consume the input when it's a Ctrl combination
			}
			// For non-Ctrl input, don't consume it - let child components handle it
		},
		{
			isActive: true,
		},
	)

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

	const handleSidebarSelect = useCallback(
		(item: ViewType | "profile" | "exit") => {
			if (item === "exit") {
				exit()
			} else if (item === "profile") {
				// Handle profile view - for now redirect to settings
				setState((prev) => ({ ...prev, currentView: "settings", sidebarVisible: false }))
			} else {
				setState((prev) => ({ ...prev, currentView: item, sidebarVisible: false }))
			}
		},
		[exit],
	)

	const handleSidebarClose = useCallback(() => {
		setState((prev) => ({ ...prev, sidebarVisible: false }))
	}, [])

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

	const renderMainContent = () => {
		switch (state.currentView) {
			case "chat":
				return (
					<ChatView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onExtensionMessage={(message: ExtensionMessage) => {
							// Forward extension messages to the ChatView
							logService.debug(`Forwarding message to ChatView: ${message.type}`, "CLI App")
							handleExtensionMessage(message)
						}}
						sidebarVisible={state.sidebarVisible}
					/>
				)
			case "history":
				return (
					<HistoryView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
						lastExtensionMessage={state.lastExtensionMessage}
						sidebarVisible={state.sidebarVisible}
					/>
				)
			case "settings":
				return (
					<SettingsView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
						sidebarVisible={state.sidebarVisible}
					/>
				)
			case "modes":
				return (
					<ModesView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
						sidebarVisible={state.sidebarVisible}
					/>
				)
			case "mcp":
				return (
					<McpView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
						sidebarVisible={state.sidebarVisible}
					/>
				)
			case "logs":
				return (
					<LogsView
						extensionState={state.extensionState}
						sendMessage={sendMessage}
						onBack={() => switchView("chat")}
						sidebarVisible={state.sidebarVisible}
					/>
				)
			default:
				return null
		}
	}

	return (
		<FullScreenLayout>
			<Box flexDirection="column" height="100%">
				{/* Main content area with sidebar */}
				<Box flexDirection="row" flexGrow={1}>
					{/* Sidebar - Shows as a side panel when visible */}
					{state.sidebarVisible && (
						<OverlaySidebar
							isVisible={state.sidebarVisible}
							currentView={state.currentView}
							onSelectItem={handleSidebarSelect}
							onClose={handleSidebarClose}
						/>
					)}

					{/* Main content area - takes up remaining space */}
					<Box flexGrow={1} flexDirection="column">
						{renderMainContent()}
					</Box>
				</Box>

				{/* Status bar - always at bottom */}
				<StatusBar extensionState={state.extensionState} workspace={options.workspace || process.cwd()} />
			</Box>
		</FullScreenLayout>
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
