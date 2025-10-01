import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useApp } from "ink"
import type { ExtensionMessage, WebviewMessage, RouterModels } from "../../types/messages.js"
import type { CliContextValue, CliState, CliActions, TUIApplicationOptions } from "./types.js"
import { logs } from "../../services/logs.js"

// Create the context
const CliContext = createContext<CliContextValue | null>(null)

// Context provider component
export const CliContextProvider: React.FC<{
	children: React.ReactNode
	options: TUIApplicationOptions
}> = ({ children, options }) => {
	const { exit } = useApp()

	// Initialize state
	const [state, setState] = useState<CliState>({
		extensionState: null,
		isLoading: true,
		error: null,
		lastExtensionMessage: null,
		routerModels: null,
		isLoadingModels: false,
		modelLoadingError: null,
		workspace: options.workspace,
		autoApprove: options.autoApprove,
		initialMode: options.initialMode,
		messageBridge: options.messageBridge,
	})

	// Handle extension messages
	const handleExtensionMessage = useCallback(
		(message: ExtensionMessage) => {
			logs.info(`Received extension message: ${message.type}`, "CLI Context")
			logs.debug(`Current isLoading state: ${state.isLoading}`, "CLI Context")
			logs.debug(`Message state: ${message.state ? "present" : "null"}`, "CLI Context")

			switch (message.type) {
				case "state":
					logs.debug("Processing state message, setting isLoading to false", "CLI Context")
					setState((prev) => {
						logs.debug(
							`Previous state - isLoading: ${prev.isLoading}, extensionState: ${prev.extensionState ? "present" : "null"}`,
							"CLI Context",
						)
						const newState = {
							...prev,
							extensionState: message.state || null,
							isLoading: false,
							// Update routerModels if present in the state
							routerModels: message.state?.routerModels || prev.routerModels,
						}
						logs.debug(
							`New state - isLoading: ${newState.isLoading}, extensionState: ${newState.extensionState ? "present" : "null"}`,
							"CLI Context",
						)
						return newState
					})
					break
				case "routerModels":
					logs.debug("Processing routerModels message", "CLI Context")
					setState((prev) => ({
						...prev,
						routerModels: message.routerModels || null,
						isLoadingModels: false,
						modelLoadingError: null,
					}))
					break
				case "action":
					// Action handling will be managed by router navigation
					// These actions can trigger navigation through the router
					logs.debug(`Received action: ${message.action}`, "CLI Context")
					break
				case "messageUpdated":
					// Handle message updates like the webview does
					if (message.clineMessage && state.extensionState) {
						logs.debug(`Updating message with ts: ${message.clineMessage.ts}`, "CLI Context")
						setState((prev) => {
							if (!prev.extensionState) return prev

							const lastIndex = prev.extensionState.clineMessages.findIndex(
								(msg) => msg.ts === message.clineMessage!.ts,
							)

							if (lastIndex !== -1) {
								const newClineMessages = [...prev.extensionState.clineMessages]
								newClineMessages[lastIndex] = message.clineMessage!
								logs.debug(`Updated existing message at index ${lastIndex}`, "CLI Context")
								return {
									...prev,
									extensionState: {
										...prev.extensionState,
										clineMessages: newClineMessages,
									},
								}
							} else {
								// Add new message
								logs.debug(`Adding new message with ts: ${message.clineMessage!.ts}`, "CLI Context")
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
					logs.debug("Received selectedImages message", "CLI Context", { images: message.images })
					// For CLI, we might want to handle this differently or pass it to the active view
					break
				case "invoke":
					// Handle invoke messages that trigger specific actions
					logs.debug(`Received invoke message: ${message.invoke}`, "CLI Context")
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
						case "setChatBoxMessage":
						case "primaryButtonClick":
						case "secondaryButtonClick":
							// These are handled by individual components
							logs.debug(`Invoke ${message.invoke} received`, "CLI Context")
							break
						default:
							logs.debug(`Unhandled invoke: ${message.invoke}`, "CLI Context")
							break
					}
					break
				case "condenseTaskContextResponse":
					// Handle context condensing response
					logs.debug("Received condenseTaskContextResponse", "CLI Context")
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
					logs.debug("Received taskHistoryResponse", "CLI Context")
					// Store the message so it can be passed to the HistoryView
					setState((prev) => ({
						...prev,
						lastExtensionMessage: message,
					}))
					break
				default:
					logs.info(`Unhandled extension message: ${message.type}`, "CLI Context")
					break
			}

			// Always update lastExtensionMessage for components that need it
			setState((prev) => ({
				...prev,
				lastExtensionMessage: message,
			}))
		},
		[state.extensionState, state.isLoading],
	)

	// Send message to extension
	const sendMessage = useCallback(
		async (message: WebviewMessage) => {
			try {
				await options.messageBridge.sendWebviewMessage(message)
			} catch (error) {
				logs.error("Failed to send message", "CLI Context", { error })
			}
		},
		[options.messageBridge],
	)

	// Navigation actions removed - handled by router
	// Sidebar actions removed - now handled by useSidebar hook with Jotai atom

	// State management actions
	const setLoading = useCallback((loading: boolean) => {
		setState((prev) => ({ ...prev, isLoading: loading }))
	}, [])

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, error }))
	}, [])

	// Model management actions
	const requestRouterModels = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoadingModels: true, modelLoadingError: null }))
		try {
			await sendMessage({ type: "requestRouterModels" })
		} catch (error) {
			logs.error("Failed to request router models", "CLI Context", { error })
			setState((prev) => ({
				...prev,
				isLoadingModels: false,
				modelLoadingError: "Failed to load models",
			}))
		}
	}, [sendMessage])

	const setRouterModels = useCallback((models: RouterModels | null) => {
		setState((prev) => ({ ...prev, routerModels: models }))
	}, [])

	const setModelLoadingState = useCallback((loading: boolean) => {
		setState((prev) => ({ ...prev, isLoadingModels: loading }))
	}, [])

	const setModelLoadingError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, modelLoadingError: error }))
	}, [])

	const gracefulExit = () => {
		options.messageBridge.removeAllListeners()
		exit()
		// setTimeout(() => {
		// 		logs.info("Forcing process exit", "CliContext")
		// 		process.exit(0)
		// 	}, 100)
	}

	// Create actions object with enhanced exit handling
	const actions: CliActions = {
		sendMessage,
		handleExtensionMessage,
		setLoading,
		setError,
		requestRouterModels,
		setRouterModels,
		setModelLoadingState,
		setModelLoadingError,
		exit: gracefulExit,
	}

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
				logs.error("Failed to request initial state", "CLI Context", { error })
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

	// Create context value
	const contextValue: CliContextValue = {
		state,
		actions,
	}

	return <CliContext.Provider value={contextValue}>{children}</CliContext.Provider>
}

// Hook to use the CLI context
export const useCliContext = (): CliContextValue => {
	const context = useContext(CliContext)
	if (!context) {
		throw new Error("useCliContext must be used within a CliContextProvider")
	}
	return context
}
