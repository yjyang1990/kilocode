import { EventEmitter } from "events"
import { createVSCodeAPIMock } from "./VSCode.js"
import { logs } from "../services/logs.js"
import type { ExtensionMessage, WebviewMessage, ExtensionState } from "../types/messages.js"

export interface ExtensionHostOptions {
	workspacePath: string
	extensionBundlePath: string // Direct path to extension.js
	extensionRootPath: string // Root path for extension assets
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
			logs.info("Activating extension...", "ExtensionHost")

			// Setup VSCode API mock
			await this.setupVSCodeAPIMock()

			// Set up console interception AFTER VSCode API setup
			this.setupConsoleInterception()

			// Load the extension
			await this.loadExtension()

			// Activate the extension
			await this.activateExtension()

			this.isActivated = true
			logs.info("Extension activated successfully", "ExtensionHost")

			// Emit activation event
			this.emit("activated", this.getAPI())

			return this.getAPI()
		} catch (error) {
			logs.error("Failed to activate extension", "ExtensionHost", { error })
			this.emit("error", error)
			throw error
		}
	}

	async deactivate(): Promise<void> {
		if (!this.isActivated) {
			return
		}

		try {
			logs.info("Deactivating extension...", "ExtensionHost")

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
			this.lastWebviewLaunchTime = 0
			this.removeAllListeners()

			logs.info("Extension deactivated", "ExtensionHost")
		} catch (error) {
			logs.error("Error during deactivation", "ExtensionHost", { error })
			throw error
		}
	}

	async sendWebviewMessage(message: WebviewMessage): Promise<void> {
		try {
			logs.debug(`Processing webview message: ${message.type}`, "ExtensionHost")

			if (!this.isActivated) {
				logs.warn("Extension not activated, ignoring message", "ExtensionHost")
				return
			}

			// Handle webviewDidLaunch for CLI state synchronization
			if (message.type === "webviewDidLaunch") {
				// Prevent rapid-fire webviewDidLaunch messages
				const now = Date.now()
				if (now - this.lastWebviewLaunchTime < 1000) {
					logs.debug("Ignoring webviewDidLaunch - too soon after last one", "ExtensionHost")
					return
				}
				this.lastWebviewLaunchTime = now
				await this.handleWebviewLaunch()
			}

			// Forward ALL messages to the extension's webview handler
			logs.debug(`Forwarding message to extension: ${message.type}`, "ExtensionHost")
			this.emit("webviewMessage", message)

			// Handle local state updates for CLI display after forwarding
			await this.handleLocalStateUpdates(message)
		} catch (error) {
			logs.error("Error handling webview message", "ExtensionHost", { error })
			this.emit("error", error)
		}
	}

	private async setupVSCodeAPIMock(): Promise<void> {
		// Create VSCode API mock with extension root path for assets
		this.vscodeAPI = createVSCodeAPIMock(this.options.extensionRootPath, this.options.workspacePath)

		// Set global vscode object for the extension
		;(global as any).vscode = this.vscodeAPI

		// Set global reference to this ExtensionHost for webview provider registration
		;(global as any).__extensionHost = this

		// Set environment variables to disable problematic features in CLI mode
		process.env.KILO_CLI_MODE = "true"
		process.env.NODE_ENV = process.env.NODE_ENV || "production"

		logs.debug("VSCode API mock setup complete", "ExtensionHost")
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

		// Override console methods to forward to LogsService ONLY (no console output)
		// IMPORTANT: Use original console methods to avoid circular dependency
		console.log = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			// Filter out extension logs that should be hidden
			if (!this.shouldHideExtensionLog(message)) {
				logs.info(message, "Extension")
			}
		}

		console.error = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logs.error(message, "Extension")
			}
		}

		console.warn = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logs.warn(message, "Extension")
			}
		}

		console.debug = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logs.debug(message, "Extension")
			}
		}

		console.info = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			if (!this.shouldHideExtensionLog(message)) {
				logs.info(message, "Extension")
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

		logs.debug("Console methods and streams restored", "ExtensionHost")
	}

	private async loadExtension(): Promise<void> {
		// Use the direct path to extension.js
		const extensionPath = this.options.extensionBundlePath

		try {
			logs.info(`Loading extension from: ${extensionPath}`, "ExtensionHost")

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

			logs.info("Extension module loaded successfully", "ExtensionHost")
		} catch (error) {
			logs.error("Failed to load extension module", "ExtensionHost", { error })
			throw new Error(`Failed to load extension: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	private async activateExtension(): Promise<void> {
		try {
			logs.info("Calling extension activate function...", "ExtensionHost")

			// Call the extension's activate function with our mocked context
			this.extensionAPI = await this.extensionModule.activate(this.vscodeAPI.context)

			// Log available API methods for debugging
			if (this.extensionAPI) {
				logs.info("Extension API methods available:", "ExtensionHost", {
					hasStartNewTask: typeof this.extensionAPI.startNewTask === "function",
					hasSendMessage: typeof this.extensionAPI.sendMessage === "function",
					hasCancelTask: typeof this.extensionAPI.cancelTask === "function",
					hasCondense: typeof this.extensionAPI.condense === "function",
					hasCondenseTaskContext: typeof this.extensionAPI.condenseTaskContext === "function",
					hasHandleTerminalOperation: typeof this.extensionAPI.handleTerminalOperation === "function",
				})
			} else {
				logs.warn("Extension API is null or undefined", "ExtensionHost")
			}

			logs.info("Extension activate function completed", "ExtensionHost")

			// Initialize state from extension
			this.initializeState()

			// Set up message listener to receive updates from the extension
			this.setupExtensionMessageListener()
		} catch (error) {
			logs.error("Extension activation failed", "ExtensionHost", { error })
			throw error
		}
	}

	private setupExtensionMessageListener(): void {
		// Listen for extension state updates and forward them
		if (this.vscodeAPI && this.vscodeAPI.context) {
			// The extension will update state through the webview provider
			// We need to listen for those updates and forward them to the CLI
			logs.debug("Setting up extension message listener", "ExtensionHost")

			// Track message IDs to prevent infinite loops
			const processedMessageIds = new Set<string>()

			// Listen for messages from the extension's webview (postMessage calls)
			this.on("extensionWebviewMessage", (message: any) => {
				// Create a unique ID for this message to prevent loops
				const messageId = `${message.type}_${Date.now()}_${JSON.stringify(message).slice(0, 50)}`

				if (processedMessageIds.has(messageId)) {
					logs.debug(`Skipping duplicate message: ${message.type}`, "ExtensionHost")
					return
				}

				processedMessageIds.add(messageId)

				// Clean up old message IDs to prevent memory leaks
				if (processedMessageIds.size > 100) {
					const oldestIds = Array.from(processedMessageIds).slice(0, 50)
					oldestIds.forEach((id) => processedMessageIds.delete(id))
				}

				logs.debug(`Received extension webview message: ${message.type}`, "ExtensionHost")

				// Only forward specific message types that are important for CLI
				switch (message.type) {
					case "state":
						// Extension is sending a full state update
						if (message.state && this.currentState) {
							this.currentState = {
								...this.currentState,
								...message.state,
								chatMessages:
									message.state.clineMessages ||
									message.state.chatMessages ||
									this.currentState.chatMessages,
								apiConfiguration: message.state.apiConfiguration || this.currentState.apiConfiguration,
								currentApiConfigName:
									message.state.currentApiConfigName || this.currentState.currentApiConfigName,
								listApiConfigMeta:
									message.state.listApiConfigMeta || this.currentState.listApiConfigMeta,
								routerModels: message.state.routerModels || this.currentState.routerModels,
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
						// The extension uses 'clineMessage' property (legacy name)
						const chatMessage = message.clineMessage || message.chatMessage
						if (chatMessage) {
							// Forward the message update to the CLI
							const emitMessage = {
								type: "messageUpdated",
								chatMessage: chatMessage,
							}
							this.emit("message", emitMessage)
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
							logs.debug("Updated listApiConfigMeta from extension", "ExtensionHost")
						}
						break

					// Don't forward these message types as they can cause loops
					case "mcpServers":
					case "theme":
					case "rulesData":
						logs.debug(`Ignoring extension message type to prevent loops: ${message.type}`, "ExtensionHost")
						break

					default:
						// Only forward other important messages
						if (message.type && !message.type.startsWith("_")) {
							logs.debug(`Forwarding extension message: ${message.type}`, "ExtensionHost")
							this.emit("message", message)
						}
						break
				}
			})

			// Set up webview message handler for messages TO the extension
			this.on("webviewMessage", async (message: any) => {
				logs.debug(`Forwarding webview message to extension: ${message.type}`, "ExtensionHost")

				// Find the registered webview provider
				const webviewProvider = this.webviewProviders.get("kilo-code.SidebarProvider")

				if (webviewProvider && typeof webviewProvider.handleMessage === "function") {
					try {
						// Call the webview provider's message handler (which should call webviewMessageHandler)
						await webviewProvider.handleMessage(message)
						logs.debug(
							`Successfully forwarded message to webview provider: ${message.type}`,
							"ExtensionHost",
						)
					} catch (error) {
						logs.error(`Error forwarding message to webview provider: ${message.type}`, "ExtensionHost", {
							error,
						})
					}
				} else {
					logs.warn(
						`No webview provider found or handleMessage not available for: ${message.type}`,
						"ExtensionHost",
					)
				}
			})
		}
	}

	private initializeState(): void {
		// Create initial state that matches the extension's expected structure
		this.currentState = {
			version: "1.0.0",
			apiConfiguration: {
				apiProvider: "kilocode",
				kilocodeToken: "",
				kilocodeModel: "",
				kilocodeOrganizationId: "",
			},
			chatMessages: [],
			mode: "code",
			customModes: [],
			taskHistoryFullLength: 0,
			taskHistoryVersion: 0,
			renderContext: "cli",
			telemetrySetting: "enabled",
			cwd: this.options.workspacePath,
			mcpServers: [],
			listApiConfigMeta: [],
			currentApiConfigName: "default",
		}

		// The CLI will inject the actual configuration through updateState
		logs.debug("Initial state created, waiting for CLI config injection", "ExtensionHost")
		this.broadcastStateUpdate()
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
						chatMessages: extensionState.chatMessages || this.currentState.chatMessages,
						routerModels: extensionState.routerModels || this.currentState.routerModels,
					}
					logs.debug("Synced state with extension on webview launch", "ExtensionHost")
				}
			} catch (error) {
				logs.warn("Failed to sync with extension state on webview launch", "ExtensionHost", { error })
			}
		}

		// Send initial state when webview launches
		this.broadcastStateUpdate()
	}

	/**
	 * Handle local state updates for CLI display purposes after forwarding to extension
	 */
	private async handleLocalStateUpdates(message: WebviewMessage): Promise<void> {
		try {
			switch (message.type) {
				case "upsertApiConfiguration":
					if (message.text && message.apiConfiguration && this.currentState) {
						// Update local state for CLI display purposes
						this.currentState.apiConfiguration = {
							...this.currentState.apiConfiguration,
							...message.apiConfiguration,
						}
						this.currentState.currentApiConfigName = message.text
						this.broadcastStateUpdate()
					}
					break

				case "loadApiConfiguration":
					// Configuration loading is handled by CLI config system
					logs.debug(`Profile loading requested but managed by CLI config: ${message.text}`, "ExtensionHost")
					break

				case "mode":
					if (message.text && this.currentState) {
						this.currentState.mode = message.text
						this.broadcastStateUpdate()
					}
					break

				case "clearTask":
					if (this.currentState) {
						this.currentState.chatMessages = []
						this.broadcastStateUpdate()
					}
					break

				case "selectImages":
					// For CLI, we don't support image selection - send empty response
					this.emit("message", {
						type: "selectedImages",
						images: [],
						context: message.context || "chat",
						messageTs: message.messageTs,
					})
					break

				default:
					// No local state updates needed for other message types
					break
			}
		} catch (error) {
			logs.error("Error handling local state updates", "ExtensionHost", { error })
		}
	}

	private broadcastStateUpdate(): void {
		if (this.currentState) {
			const stateMessage: ExtensionMessage = {
				type: "state",
				state: this.currentState,
			}
			logs.debug("Broadcasting state update", "ExtensionHost", {
				messageCount: this.currentState.chatMessages.length,
				mode: this.currentState.mode,
			})
			this.emit("message", stateMessage)
		}
	}

	public getAPI(): ExtensionAPI {
		return {
			getState: () => this.currentState,
			sendMessage: (message: ExtensionMessage) => {
				logs.debug(`Sending message: ${message.type}`, "ExtensionHost")
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

	/**
	 * Send configuration sync messages to the extension
	 * This is the shared logic used by both injectConfiguration and external sync calls
	 */
	public async syncConfigurationMessages(configState: Partial<ExtensionState>): Promise<void> {
		// Send API configuration if present
		if (configState.apiConfiguration) {
			await this.sendWebviewMessage({
				type: "upsertApiConfiguration",
				text: configState.currentApiConfigName || "default",
				apiConfiguration: configState.apiConfiguration,
			})
		}

		// Sync mode if present
		if (configState.mode) {
			await this.sendWebviewMessage({
				type: "mode",
				text: configState.mode,
			})
		}

		// Sync telemetry setting if present
		if (configState.telemetrySetting) {
			await this.sendWebviewMessage({
				type: "telemetrySettings",
				text: configState.telemetrySetting,
			})
		}
	}

	/**
	 * Inject CLI configuration into the extension state
	 * This should be called after the CLI config is loaded
	 */
	public async injectConfiguration(configState: Partial<ExtensionState>): Promise<void> {
		if (!this.currentState) {
			logs.warn("Cannot inject configuration: no current state", "ExtensionHost")
			return
		}

		// Merge the configuration into current state
		this.currentState = {
			...this.currentState,
			...configState,
		}

		// Send configuration to the extension through webview message
		// This ensures the extension's internal state is updated
		await this.syncConfigurationMessages(configState)

		// Broadcast the updated state
		this.broadcastStateUpdate()
	}

	// Methods for webview provider registration (called from VSCode API mock)
	registerWebviewProvider(viewId: string, provider: any): void {
		this.webviewProviders.set(viewId, provider)
		logs.debug(`Registered webview provider: ${viewId}`, "ExtensionHost")
	}

	unregisterWebviewProvider(viewId: string): void {
		this.webviewProviders.delete(viewId)
		logs.debug(`Unregistered webview provider: ${viewId}`, "ExtensionHost")
	}
}

export function createExtensionHost(options: ExtensionHostOptions): ExtensionHost {
	return new ExtensionHost(options)
}
