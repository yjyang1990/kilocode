import { EventEmitter } from "events"
import * as path from "path"
import { createVSCodeAPIMock } from "./VSCode.js"
import { logService } from "../services/LogService.js"
import type { ExtensionMessage, WebviewMessage, ExtensionState } from "../types/messages.js"

export interface ExtensionHostOptions {
	workspacePath: string
	extensionPath: string
	binUnpackedPath: string
}

export interface ExtensionAPI {
	getState: () => ExtensionState | null
	sendMessage: (message: ExtensionMessage) => void
	updateState: (updates: Partial<ExtensionState>) => void
}

export class ExtensionHost extends EventEmitter {
	private options: ExtensionHostOptions
	private isActivated = false
	private currentState: ExtensionState | null = null
	private extensionModule: any = null
	private extensionAPI: any = null
	private vscodeAPI: any = null
	private webviewProviders: Map<string, any> = new Map()
	private originalConsole: {
		log: typeof console.log
		error: typeof console.error
		warn: typeof console.warn
		debug: typeof console.debug
		info: typeof console.info
	} | null = null
	private originalStdout: {
		write: typeof process.stdout.write
	} | null = null
	private originalStderr: {
		write: typeof process.stderr.write
	} | null = null
	private processedWebviewMessages = new Set<string>()
	private lastWebviewLaunchTime = 0

	constructor(options: ExtensionHostOptions) {
		super()
		this.options = options
	}

	async activate(): Promise<ExtensionAPI> {
		if (this.isActivated) {
			return this.getAPI()
		}

		try {
			logService.info("Activating extension...", "ExtensionHost")

			// Setup VSCode API mock
			await this.setupVSCodeAPIMock()

			// Set up console interception AFTER VSCode API setup
			this.setupConsoleInterception()

			// Load the extension
			await this.loadExtension()

			// Activate the extension
			await this.activateExtension()

			this.isActivated = true
			logService.info("Extension activated successfully", "ExtensionHost")

			// Emit activation event
			this.emit("activated", this.getAPI())

			return this.getAPI()
		} catch (error) {
			logService.error("Failed to activate extension", "ExtensionHost", { error })
			this.emit("error", error)
			throw error
		}
	}

	async deactivate(): Promise<void> {
		if (!this.isActivated) {
			return
		}

		try {
			logService.info("Deactivating extension...", "ExtensionHost")

			// Call extension's deactivate function if it exists
			if (this.extensionModule && typeof this.extensionModule.deactivate === "function") {
				await this.extensionModule.deactivate()
			}

			// Clean up VSCode API mock
			if (this.vscodeAPI && this.vscodeAPI.context) {
				// Dispose all subscriptions
				for (const subscription of this.vscodeAPI.context.subscriptions) {
					if (subscription && typeof subscription.dispose === "function") {
						subscription.dispose()
					}
				}
			}

			// Restore original console methods
			this.restoreConsole()

			this.isActivated = false
			this.currentState = null
			this.extensionModule = null
			this.extensionAPI = null
			this.vscodeAPI = null
			this.webviewProviders.clear()
			this.processedWebviewMessages.clear()
			this.lastWebviewLaunchTime = 0
			this.removeAllListeners()

			logService.info("Extension deactivated", "ExtensionHost")
		} catch (error) {
			logService.error("Error during deactivation", "ExtensionHost", { error })
			throw error
		}
	}

	async sendWebviewMessage(message: WebviewMessage): Promise<void> {
		try {
			logService.debug(`Processing webview message: ${message.type}`, "ExtensionHost")

			if (!this.isActivated) {
				logService.warn("Extension not activated, ignoring message", "ExtensionHost")
				return
			}

			// Handle different message types
			switch (message.type) {
				case "webviewDidLaunch":
					// Prevent rapid-fire webviewDidLaunch messages
					const now = Date.now()
					if (now - this.lastWebviewLaunchTime < 1000) {
						logService.debug("Ignoring webviewDidLaunch - too soon after last one", "ExtensionHost")
						return
					}
					this.lastWebviewLaunchTime = now
					await this.handleWebviewLaunch()
					break

				case "newTask":
					if (message.text) {
						await this.handleNewTask(message.text, message.images)
					}
					break

				case "askResponse":
					await this.handleAskResponse(
						message.askResponse || message.text || "",
						message.text,
						message.images,
					)
					break

				case "mode":
					if (message.text) {
						await this.handleModeChange(message.text)
					}
					break

				case "clearTask":
					await this.handleClearTask()
					break

				case "cancelTask":
					await this.handleCancelTask()
					break

				case "selectImages":
					await this.handleSelectImages()
					break

				case "terminalOperation":
					if (message.terminalOperation) {
						await this.handleTerminalOperation(message.terminalOperation)
					}
					break

				case "condense":
					if (message.text) {
						await this.handleCondense(message.text)
					}
					break

				case "condenseTaskContextRequest":
					if (message.text) {
						await this.handleCondenseTaskContextRequest(message.text)
					}
					break

				case "upsertApiConfiguration":
					// Handle API configuration updates - forward to extension for proper handling
					if (message.text && message.apiConfiguration) {
						try {
							logService.debug(
								`Forwarding upsertApiConfiguration to extension: ${message.text}`,
								"ExtensionHost",
							)

							// Forward the message to the extension's webview handler
							// The extension will handle updating ProviderSettingsManager
							this.emit("webviewMessage", message)

							// Also update local state for CLI display purposes
							if (this.currentState) {
								this.currentState.apiConfiguration = {
									...this.currentState.apiConfiguration,
									...message.apiConfiguration,
								}
								this.currentState.currentApiConfigName = message.text

								// Persist locally for CLI state
								await this.persistApiConfiguration(message.text, message.apiConfiguration)

								this.broadcastStateUpdate()
							}

							logService.debug(
								`Forwarded and updated API configuration: ${message.text}`,
								"ExtensionHost",
							)
						} catch (error) {
							logService.error("Error updating API configuration", "ExtensionHost", { error })
						}
					}
					break

				case "loadApiConfiguration":
					// Handle profile switching in CLI
					if (message.text) {
						logService.debug(`Loading API configuration profile: ${message.text}`, "ExtensionHost")

						try {
							await this.handleLoadApiConfiguration(message.text)
						} catch (error) {
							logService.error("Error loading API configuration", "ExtensionHost", { error })
						}

						// Also forward to extension for consistency
						this.emit("webviewMessage", message)
					}
					break

				case "showTaskWithId":
					// Forward task loading request to extension
					if (message.text) {
						logService.debug(`Forwarding showTaskWithId to extension: ${message.text}`, "ExtensionHost")

						// Forward to extension
						this.emit("webviewMessage", message)
					}
					break

				case "taskHistoryRequest":
					// Forward task history request to extension
					logService.debug("Forwarding taskHistoryRequest to extension", "ExtensionHost")
					this.emit("webviewMessage", message)
					break

				default:
					// For unhandled message types, forward them to the extension
					logService.debug(`Forwarding unhandled message type to extension: ${message.type}`, "ExtensionHost")
					this.emit("webviewMessage", message)
					break
			}
		} catch (error) {
			logService.error("Error handling webview message", "ExtensionHost", { error })
			this.emit("error", error)
		}
	}

	private async setupVSCodeAPIMock(): Promise<void> {
		// Create VSCode API mock
		this.vscodeAPI = createVSCodeAPIMock(this.options.extensionPath, this.options.workspacePath)

		// Set global vscode object for the extension
		;(global as any).vscode = this.vscodeAPI

		// Set global reference to this ExtensionHost for webview provider registration
		;(global as any).__extensionHost = this

		// Set environment variables to disable problematic features in CLI mode
		process.env.KILO_CLI_MODE = "true"
		process.env.NODE_ENV = process.env.NODE_ENV || "production"

		logService.debug("VSCode API mock setup complete", "ExtensionHost")
	}

	private setupConsoleInterception(): void {
		// Store original console methods
		this.originalConsole = {
			log: console.log,
			error: console.error,
			warn: console.warn,
			debug: console.debug,
			info: console.info,
		}

		// Store original stdout/stderr write methods
		this.originalStdout = {
			write: process.stdout.write.bind(process.stdout),
		}
		this.originalStderr = {
			write: process.stderr.write.bind(process.stderr),
		}

		// Override console methods to forward to LogService ONLY (no console output)
		// IMPORTANT: Use original console methods to avoid circular dependency
		console.log = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			// Filter out extension logs that should be hidden
			if (!this.shouldHideExtensionLog(message)) {
				logService.info(message, "Extension")
			}
		}

		console.error = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logService.error(message, "Extension")
			}
		}

		console.warn = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logService.warn(message, "Extension")
			}
		}

		console.debug = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logService.debug(message, "Extension")
			}
		}

		console.info = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logService.info(message, "Extension")
			}
		}

		// Intercept stdout/stderr to catch direct writes that bypass console
		const extensionHost = this
		const originalStdoutWrite = this.originalStdout!.write
		const originalStderrWrite = this.originalStderr!.write

		process.stdout.write = function (chunk: any, encoding?: any, callback?: any): boolean {
			const message = chunk.toString()
			// Only hide extension logs, allow everything else through
			if (extensionHost.shouldHideExtensionLog(message)) {
				// Hide the log by not writing to stdout, but still call callback
				if (typeof encoding === "function") {
					callback = encoding
					encoding = undefined
				}
				if (callback) callback()
				return true
			} else {
				// Allow non-extension logs to pass through normally
				return originalStdoutWrite.call(this, chunk, encoding, callback)
			}
		}

		process.stderr.write = function (chunk: any, encoding?: any, callback?: any): boolean {
			const message = chunk.toString()
			// Only hide extension logs, allow everything else through
			if (extensionHost.shouldHideExtensionLog(message)) {
				// Hide the log by not writing to stderr, but still call callback
				if (typeof encoding === "function") {
					callback = encoding
					encoding = undefined
				}
				if (callback) callback()
				return true
			} else {
				// Allow non-extension logs to pass through normally
				return originalStderrWrite.call(this, chunk, encoding, callback)
			}
		}
	}

	/**
	 * Determine if an extension log should be hidden from the user
	 */
	private shouldHideExtensionLog(message: string): boolean {
		// Hide logs that match extension internal patterns
		const hiddenPatterns = [
			/^\[createTask\]/,
			/^\[Task#/,
			/^\[e#/,
			/^Fetched default model from/,
			/^getCommitRangeForNewCompletion:/,
			/Task#ask will block/,
			/git = \d+\.\d+\.\d+/,
			/initialized shadow repo/,
			/checkpoint saved in/,
			/starting checkpoint save/,
			/creating shadow git repo/,
			/initializing checkpoints service/,
			/initializing shadow git/,
		]

		return hiddenPatterns.some((pattern) => pattern.test(message.trim()))
	}

	private restoreConsole(): void {
		if (this.originalConsole) {
			console.log = this.originalConsole.log
			console.error = this.originalConsole.error
			console.warn = this.originalConsole.warn
			console.debug = this.originalConsole.debug
			console.info = this.originalConsole.info
			this.originalConsole = null
		}

		if (this.originalStdout) {
			process.stdout.write = this.originalStdout.write
			this.originalStdout = null
		}

		if (this.originalStderr) {
			process.stderr.write = this.originalStderr.write
			this.originalStderr = null
		}

		logService.debug("Console methods and streams restored", "ExtensionHost")
	}

	private async loadExtension(): Promise<void> {
		const extensionPath = path.join(this.options.binUnpackedPath, "dist", "extension.js")

		try {
			logService.info(`Loading extension from: ${extensionPath}`, "ExtensionHost")

			// Use createRequire to load CommonJS module from ES module context
			const { createRequire } = await import("module")
			const require = createRequire(import.meta.url)

			// Simple module interception for vscode only - all other dependencies should be available
			const Module = await import("module")
			const ModuleClass = Module.default as any
			const originalResolveFilename = ModuleClass._resolveFilename

			ModuleClass._resolveFilename = function (request: string, parent: any, isMain: boolean, options?: any) {
				if (request === "vscode") {
					return "vscode-mock"
				}
				// Let all other modules (including events) resolve normally since we have dependencies
				return originalResolveFilename.call(this, request, parent, isMain, options)
			}

			// Set up the vscode module in require cache
			require.cache["vscode-mock"] = {
				id: "vscode-mock",
				filename: "vscode-mock",
				loaded: true,
				parent: null,
				children: [],
				exports: this.vscodeAPI,
				paths: [],
			} as any

			// Clear extension require cache to ensure fresh load
			if (require.cache[extensionPath]) {
				delete require.cache[extensionPath]
			}

			// Load the extension module
			this.extensionModule = require(extensionPath)

			// Restore original resolve function
			ModuleClass._resolveFilename = originalResolveFilename

			if (!this.extensionModule) {
				throw new Error("Extension module is null or undefined")
			}

			if (typeof this.extensionModule.activate !== "function") {
				throw new Error("Extension module does not export an activate function")
			}

			logService.info("Extension module loaded successfully", "ExtensionHost")
		} catch (error) {
			logService.error("Failed to load extension module", "ExtensionHost", { error })
			throw new Error(`Failed to load extension: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	private async activateExtension(): Promise<void> {
		try {
			logService.info("Calling extension activate function...", "ExtensionHost")

			// Call the extension's activate function with our mocked context
			this.extensionAPI = await this.extensionModule.activate(this.vscodeAPI.context)

			// Log available API methods for debugging
			if (this.extensionAPI) {
				logService.info("Extension API methods available:", "ExtensionHost", {
					hasStartNewTask: typeof this.extensionAPI.startNewTask === "function",
					hasSendMessage: typeof this.extensionAPI.sendMessage === "function",
					hasCancelTask: typeof this.extensionAPI.cancelTask === "function",
					hasCondense: typeof this.extensionAPI.condense === "function",
					hasCondenseTaskContext: typeof this.extensionAPI.condenseTaskContext === "function",
					hasHandleTerminalOperation: typeof this.extensionAPI.handleTerminalOperation === "function",
				})
			} else {
				logService.warn("Extension API is null or undefined", "ExtensionHost")
			}

			logService.info("Extension activate function completed", "ExtensionHost")

			// Initialize state from extension
			this.initializeState()

			// Set up message listener to receive updates from the extension
			this.setupExtensionMessageListener()
		} catch (error) {
			logService.error("Extension activation failed", "ExtensionHost", { error })
			throw error
		}
	}

	private setupExtensionMessageListener(): void {
		// Listen for extension state updates and forward them
		if (this.vscodeAPI && this.vscodeAPI.context) {
			// The extension will update state through the webview provider
			// We need to listen for those updates and forward them to the CLI
			logService.debug("Setting up extension message listener", "ExtensionHost")

			// Track message IDs to prevent infinite loops
			const processedMessageIds = new Set<string>()

			// Listen for messages from the extension's webview (postMessage calls)
			this.on("extensionWebviewMessage", (message: any) => {
				// Create a unique ID for this message to prevent loops
				const messageId = `${message.type}_${Date.now()}_${JSON.stringify(message).slice(0, 50)}`

				if (processedMessageIds.has(messageId)) {
					logService.debug(`Skipping duplicate message: ${message.type}`, "ExtensionHost")
					return
				}

				processedMessageIds.add(messageId)

				// Clean up old message IDs to prevent memory leaks
				if (processedMessageIds.size > 100) {
					const oldestIds = Array.from(processedMessageIds).slice(0, 50)
					oldestIds.forEach((id) => processedMessageIds.delete(id))
				}

				logService.debug(`Received extension webview message: ${message.type}`, "ExtensionHost")

				// Only forward specific message types that are important for CLI
				switch (message.type) {
					case "state":
						// Extension is sending a full state update
						if (message.state && this.currentState) {
							// Update our state with the extension's state, particularly clineMessages and apiConfiguration
							this.currentState = {
								...this.currentState,
								...message.state,
								clineMessages: message.state.clineMessages || this.currentState.clineMessages,
								apiConfiguration: message.state.apiConfiguration || this.currentState.apiConfiguration,
								currentApiConfigName:
									message.state.currentApiConfigName || this.currentState.currentApiConfigName,
								listApiConfigMeta:
									message.state.listApiConfigMeta || this.currentState.listApiConfigMeta,
							}

							// Forward the updated state to the CLI
							this.emit("message", {
								type: "state",
								state: this.currentState,
							})
						}
						break

					case "messageUpdated":
						// Extension is sending an individual message update
						if (message.clineMessage) {
							// Forward the message update to the CLI
							this.emit("message", {
								type: "messageUpdated",
								clineMessage: message.clineMessage,
							})
						}
						break

					case "taskHistoryResponse":
						// Extension is sending task history data
						if (message.payload) {
							// Forward the task history response to the CLI
							this.emit("message", {
								type: "taskHistoryResponse",
								payload: message.payload,
							})
						}
						break

					// Handle configuration-related messages from extension
					case "listApiConfig":
						// Extension is sending updated API configuration list
						if (message.listApiConfigMeta && this.currentState) {
							this.currentState.listApiConfigMeta = message.listApiConfigMeta
							logService.debug("Updated listApiConfigMeta from extension", "ExtensionHost")
						}
						break

					// Don't forward these message types as they can cause loops
					case "mcpServers":
					case "theme":
					case "rulesData":
						logService.debug(
							`Ignoring extension message type to prevent loops: ${message.type}`,
							"ExtensionHost",
						)
						break

					default:
						// Only forward other important messages
						if (message.type && !message.type.startsWith("_")) {
							logService.debug(`Forwarding extension message: ${message.type}`, "ExtensionHost")
							this.emit("message", message)
						}
						break
				}
			})

			// Set up webview message handler for messages TO the extension
			this.on("webviewMessage", (message: any) => {
				logService.debug(`Handling webview message from CLI to extension: ${message.type}`, "ExtensionHost")
				// These are messages from the CLI that need to be sent to the extension
			})
		}
	}

	private initializeState(): void {
		// Create initial state that matches the extension's expected structure
		this.currentState = {
			version: "1.0.0",
			apiConfiguration: {
				apiProvider: "kilocode",
				kilocodeToken: process.env.KILOCODE_TOKEN || "",
				kilocodeModel: "claude-3-5-sonnet-20241022",
				kilocodeOrganizationId: "",
			},
			clineMessages: [],
			mode: "code",
			customModes: [],
			taskHistoryFullLength: 0,
			taskHistoryVersion: 0,
			renderContext: "cli",
			telemetrySetting: "disabled",
			cwd: this.options.workspacePath,
			mcpServers: [],
			listApiConfigMeta: [],
			currentApiConfigName: "default",
		}

		// Load persisted configuration immediately and sync with extension
		this.loadPersistedConfiguration()
			.then(() => {
				// Try to sync with extension state if available
				if (this.extensionAPI && typeof this.extensionAPI.getState === "function") {
					try {
						const extensionState = this.extensionAPI.getState()
						if (extensionState) {
							logService.debug("Syncing with extension state during initialization", "ExtensionHost")
							// Merge extension state but preserve CLI-set values
							this.currentState = {
								...this.currentState,
								...extensionState,
								// Preserve CLI-specific values
								renderContext: "cli",
								cwd: this.options.workspacePath,
							}
						}
					} catch (error) {
						logService.warn("Failed to sync with extension state during initialization", "ExtensionHost", {
							error,
						})
					}
				}

				this.broadcastStateUpdate()
			})
			.catch((error) => {
				logService.error("Failed to load persisted configuration during initialization", "ExtensionHost", {
					error,
				})
				this.broadcastStateUpdate()
			})
	}

	private async handleWebviewLaunch(): Promise<void> {
		// Sync with extension state when webview launches
		if (this.extensionAPI && typeof this.extensionAPI.getState === "function") {
			try {
				const extensionState = this.extensionAPI.getState()
				if (extensionState && this.currentState) {
					// Merge extension state with current state, preserving CLI context
					this.currentState = {
						...this.currentState,
						apiConfiguration: extensionState.apiConfiguration || this.currentState.apiConfiguration,
						currentApiConfigName:
							extensionState.currentApiConfigName || this.currentState.currentApiConfigName,
						listApiConfigMeta: extensionState.listApiConfigMeta || this.currentState.listApiConfigMeta,
						mode: extensionState.mode || this.currentState.mode,
						clineMessages: extensionState.clineMessages || this.currentState.clineMessages,
					}
					logService.debug("Synced state with extension on webview launch", "ExtensionHost")
				}
			} catch (error) {
				logService.warn("Failed to sync with extension state on webview launch", "ExtensionHost", { error })
			}
		}

		// Send initial state when webview launches
		this.broadcastStateUpdate()
	}

	private async handleNewTask(text: string, images?: string[]): Promise<void> {
		logService.debug("Handling new task", "ExtensionHost", { text, images })

		try {
			// Forward the new task to the real extension API
			if (this.extensionAPI && typeof this.extensionAPI.startNewTask === "function") {
				await this.extensionAPI.startNewTask({
					configuration: this.currentState?.apiConfiguration || {},
					text,
					images,
				})
				logService.debug("Successfully forwarded new task to extension API", "ExtensionHost")
			} else {
				logService.warn("Extension API startNewTask not available", "ExtensionHost")

				// If extension API is not available, we need to handle this gracefully
				// The extension should populate clineMessages through its normal flow
				if (this.currentState) {
					// Just broadcast current state to ensure UI is updated
					this.broadcastStateUpdate()
				}
			}
		} catch (error) {
			logService.error("Error handling new task", "ExtensionHost", { error })

			// Create error message for user if extension fails
			if (this.currentState) {
				const errorMessage = {
					ts: Date.now(),
					type: "say" as const,
					say: "error" as const,
					text: `Error starting task: ${error instanceof Error ? error.message : String(error)}`,
				}

				this.currentState.clineMessages = [...this.currentState.clineMessages, errorMessage]
				this.broadcastStateUpdate()
			}
		}
	}

	private async handleAskResponse(askResponse: string, text?: string, images?: string[]): Promise<void> {
		// Handle user response to AI questions
		logService.debug(`Handling ask response: ${askResponse}`, "ExtensionHost", { text, images })

		try {
			// Forward the ask response to the real extension API
			if (this.extensionAPI && typeof this.extensionAPI.sendMessage === "function") {
				await this.extensionAPI.sendMessage({ askResponse, text, images })
				logService.debug("Successfully forwarded ask response to extension API", "ExtensionHost")
			} else {
				logService.warn("Extension API sendMessage not available", "ExtensionHost")
			}
		} catch (error) {
			logService.error("Error handling ask response", "ExtensionHost", { error })
		}
	}

	private async handleClearTask(): Promise<void> {
		// Handle clearing/resetting the current task
		logService.debug("Handling clear task", "ExtensionHost")

		if (this.currentState) {
			this.currentState.clineMessages = []
			this.broadcastStateUpdate()
		}
	}

	private async handleCancelTask(): Promise<void> {
		// Handle canceling the current task
		logService.debug("Handling cancel task", "ExtensionHost")

		if (this.extensionAPI && typeof this.extensionAPI.cancelTask === "function") {
			try {
				await this.extensionAPI.cancelTask()
			} catch (error) {
				logService.error("Error canceling task", "ExtensionHost", { error })
			}
		}
	}

	private async handleSelectImages(): Promise<void> {
		// Handle image selection request
		logService.debug("Handling select images", "ExtensionHost")

		// For CLI, we might not support image selection or handle it differently
		// Send empty images response for now
		this.emit("message", {
			type: "selectedImages",
			images: [],
			context: "chat",
		})
	}

	private async handleTerminalOperation(operation: string): Promise<void> {
		// Handle terminal operations (continue, abort)
		logService.debug(`Handling terminal operation: ${operation}`, "ExtensionHost")

		if (this.extensionAPI && typeof this.extensionAPI.handleTerminalOperation === "function") {
			try {
				await this.extensionAPI.handleTerminalOperation(operation)
			} catch (error) {
				logService.error("Error handling terminal operation", "ExtensionHost", { error })
			}
		}
	}

	private async handleCondense(text: string): Promise<void> {
		// Handle context condensing
		logService.debug("Handling condense", "ExtensionHost", { text })

		if (this.extensionAPI && typeof this.extensionAPI.condense === "function") {
			try {
				await this.extensionAPI.condense(text)
			} catch (error) {
				logService.error("Error handling condense", "ExtensionHost", { error })
			}
		}
	}

	private async handleCondenseTaskContextRequest(taskId: string): Promise<void> {
		// Handle task context condensing request
		logService.debug("Handling condense task context request", "ExtensionHost", { taskId })

		if (this.extensionAPI && typeof this.extensionAPI.condenseTaskContext === "function") {
			try {
				await this.extensionAPI.condenseTaskContext(taskId)

				// Send response back
				this.emit("message", {
					type: "condenseTaskContextResponse",
					text: taskId,
				})
			} catch (error) {
				logService.error("Error handling condense task context", "ExtensionHost", { error })
			}
		}
	}

	private async handleModeChange(mode: string): Promise<void> {
		// Handle mode changes
		if (this.currentState) {
			this.currentState.mode = mode
			this.broadcastStateUpdate()
		}
	}

	private async handleLoadApiConfiguration(profileName: string): Promise<void> {
		try {
			const secretsKey = "roo_cline_config_api_config"

			// Load profiles from secrets storage
			const content = await this.vscodeAPI.context.secrets.get(secretsKey)
			if (!content) {
				logService.warn(`No profiles found when trying to load profile: ${profileName}`, "ExtensionHost")
				return
			}

			const providerProfiles = JSON.parse(content)

			// Check if the requested profile exists
			if (!providerProfiles.apiConfigs[profileName]) {
				logService.warn(`Profile '${profileName}' not found`, "ExtensionHost")
				return
			}

			// Update current profile name
			providerProfiles.currentApiConfigName = profileName

			// Save the updated profiles back to secrets
			await this.vscodeAPI.context.secrets.store(secretsKey, JSON.stringify(providerProfiles, null, 2))

			// Update current state
			if (this.currentState) {
				const selectedProfile = providerProfiles.apiConfigs[profileName]
				this.currentState.apiConfiguration = {
					...this.currentState.apiConfiguration,
					...selectedProfile,
				}
				this.currentState.currentApiConfigName = profileName

				// Update the profile list metadata
				const listApiConfigMeta = Object.entries(providerProfiles.apiConfigs).map(
					([name, profile]: [string, any]) => ({
						id: profile.id || "",
						name,
						apiProvider: profile.apiProvider,
						modelId:
							this.cleanModelId(
								profile.apiModelId ||
									profile.kilocodeModel ||
									profile.openAiModelId ||
									profile.anthropicModel,
							) || "",
					}),
				)
				this.currentState.listApiConfigMeta = listApiConfigMeta

				this.broadcastStateUpdate()
			}

			logService.debug(`Successfully loaded API configuration profile: ${profileName}`, "ExtensionHost")
		} catch (error) {
			logService.error("Failed to load API configuration profile", "ExtensionHost", { error })
		}
	}

	private broadcastStateUpdate(): void {
		if (this.currentState) {
			const stateMessage: ExtensionMessage = {
				type: "state",
				state: this.currentState,
			}
			logService.debug("Broadcasting state update", "ExtensionHost", {
				messageCount: this.currentState.clineMessages.length,
				mode: this.currentState.mode,
			})
			this.emit("message", stateMessage)
		}
	}

	private async persistApiConfiguration(configName: string, apiConfiguration: any): Promise<void> {
		try {
			const secretsKey = "roo_cline_config_api_config"

			// Load existing profiles
			let providerProfiles: any
			try {
				const existingContent = await this.vscodeAPI.context.secrets.get(secretsKey)
				providerProfiles = existingContent ? JSON.parse(existingContent) : null
			} catch (error) {
				logService.warn("Failed to load existing profiles", "ExtensionHost", { error })
				providerProfiles = null
			}

			// Initialize default structure if no profiles exist
			if (!providerProfiles) {
				providerProfiles = {
					currentApiConfigName: configName,
					apiConfigs: {},
					modeApiConfigs: {},
					migrations: {
						rateLimitSecondsMigrated: true,
						diffSettingsMigrated: true,
						openAiHeadersMigrated: true,
						consecutiveMistakeLimitMigrated: true,
						todoListEnabledMigrated: true,
						morphApiKeyMigrated: true,
					},
				}
			}

			// Generate ID for new profiles or preserve existing ID
			let profileId = providerProfiles.apiConfigs[configName]?.id
			if (!profileId) {
				profileId = Math.random().toString(36).substring(2, 15)
			}

			// Update the specific profile
			providerProfiles.apiConfigs[configName] = {
				...apiConfiguration,
				id: profileId,
			}

			// Update current profile name
			providerProfiles.currentApiConfigName = configName

			// Save back to secrets
			await this.vscodeAPI.context.secrets.store(secretsKey, JSON.stringify(providerProfiles, null, 2))

			// Update current state immediately
			if (this.currentState) {
				this.currentState.apiConfiguration = {
					...this.currentState.apiConfiguration,
					...apiConfiguration,
				}
				this.currentState.currentApiConfigName = configName

				// Update the profile list metadata
				const listApiConfigMeta = Object.entries(providerProfiles.apiConfigs).map(
					([name, profile]: [string, any]) => ({
						id: profile.id || "",
						name,
						apiProvider: profile.apiProvider,
						modelId:
							this.cleanModelId(
								profile.apiModelId ||
									profile.kilocodeModel ||
									profile.openAiModelId ||
									profile.anthropicModel,
							) || "",
					}),
				)
				this.currentState.listApiConfigMeta = listApiConfigMeta
			}

			logService.debug(`Persisted API configuration profile: ${configName}`, "ExtensionHost", {
				profileId,
				fields: Object.keys(apiConfiguration),
			})
		} catch (error) {
			logService.error("Failed to persist API configuration", "ExtensionHost", { error })
			throw error
		}
	}

	private async loadPersistedConfiguration(): Promise<void> {
		try {
			const secretsKey = "roo_cline_config_api_config"

			// Load profiles from secrets storage
			let providerProfiles: any = null
			try {
				const content = await this.vscodeAPI.context.secrets.get(secretsKey)
				if (content) {
					providerProfiles = JSON.parse(content)
				}
			} catch (error) {
				logService.warn("Failed to load profiles from secrets", "ExtensionHost", { error })
			}

			// Initialize default profile if no profiles exist
			if (
				!providerProfiles ||
				!providerProfiles.apiConfigs ||
				Object.keys(providerProfiles.apiConfigs).length === 0
			) {
				const defaultId = Math.random().toString(36).substring(2, 15)
				providerProfiles = {
					currentApiConfigName: "default",
					apiConfigs: {
						default: {
							id: defaultId,
							apiProvider: "kilocode",
							kilocodeToken: process.env.KILOCODE_TOKEN || "",
							kilocodeModel: "anthropic/claude-sonnet-4",
							kilocodeOrganizationId: "",
						},
					},
					modeApiConfigs: {},
					migrations: {
						rateLimitSecondsMigrated: true,
						diffSettingsMigrated: true,
						openAiHeadersMigrated: true,
						consecutiveMistakeLimitMigrated: true,
						todoListEnabledMigrated: true,
						morphApiKeyMigrated: true,
					},
				}

				// Save the default profile
				await this.vscodeAPI.context.secrets.store(secretsKey, JSON.stringify(providerProfiles, null, 2))
			}

			const currentApiConfigName = providerProfiles.currentApiConfigName || "default"
			const currentProfile =
				providerProfiles.apiConfigs[currentApiConfigName] || Object.values(providerProfiles.apiConfigs)[0]

			// Build list of profile metadata
			const listApiConfigMeta = Object.entries(providerProfiles.apiConfigs).map(
				([name, profile]: [string, any]) => ({
					id: profile.id || "",
					name,
					apiProvider: profile.apiProvider,
					modelId:
						this.cleanModelId(
							profile.apiModelId ||
								profile.kilocodeModel ||
								profile.openAiModelId ||
								profile.anthropicModel,
						) || "",
				}),
			)

			// Update current state with loaded configuration
			if (this.currentState) {
				this.currentState.apiConfiguration = {
					...this.currentState.apiConfiguration,
					...currentProfile,
				}
				this.currentState.currentApiConfigName = currentApiConfigName
				this.currentState.listApiConfigMeta = listApiConfigMeta
			}

			logService.debug("Loaded persisted configuration from secrets storage", "ExtensionHost", {
				currentApiConfigName,
				profileCount: Object.keys(providerProfiles.apiConfigs).length,
				loadedFields: Object.keys(currentProfile || {}),
			})
		} catch (error) {
			logService.warn("Failed to load persisted configuration", "ExtensionHost", { error })
		}
	}

	/**
	 * Clean model ID by removing prefix before "/"
	 */
	private cleanModelId(modelId: string | undefined): string | undefined {
		if (!modelId) return undefined

		// Check for "/" and take the part after it
		if (modelId.includes("/")) {
			return modelId.split("/").pop()
		}

		return modelId
	}

	public getAPI(): ExtensionAPI {
		return {
			getState: () => this.currentState,
			sendMessage: (message: ExtensionMessage) => {
				logService.debug(`Sending message: ${message.type}`, "ExtensionHost")
				this.emit("message", message)
			},
			updateState: (updates: Partial<ExtensionState>) => {
				if (this.currentState) {
					this.currentState = { ...this.currentState, ...updates }
					this.broadcastStateUpdate()
				}
			},
		}
	}

	// Methods for webview provider registration (called from VSCode API mock)
	registerWebviewProvider(viewId: string, provider: any): void {
		this.webviewProviders.set(viewId, provider)
		logService.debug(`Registered webview provider: ${viewId}`, "ExtensionHost")
	}

	unregisterWebviewProvider(viewId: string): void {
		this.webviewProviders.delete(viewId)
		logService.debug(`Unregistered webview provider: ${viewId}`, "ExtensionHost")
	}
}

export function createExtensionHost(options: ExtensionHostOptions): ExtensionHost {
	return new ExtensionHost(options)
}
