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

			if (!this.isActivated || !this.extensionAPI) {
				logService.warn("Extension not activated, ignoring message", "ExtensionHost")
				return
			}

			// Handle different message types
			switch (message.type) {
				case "webviewDidLaunch":
					await this.handleWebviewLaunch()
					break

				case "newTask":
					if (message.text) {
						await this.handleNewTask(message.text, message.images)
					}
					break

				case "askResponse":
					if (message.text) {
						await this.handleAskResponse(message.text)
					}
					break

				case "mode":
					if (message.text) {
						await this.handleModeChange(message.text)
					}
					break

				default:
					logService.debug(`Unhandled webview message type: ${message.type}`, "ExtensionHost")
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

		// Set environment variables to disable problematic features in CLI mode
		process.env.KILO_CLI_MODE = "true"
		process.env.NODE_ENV = process.env.NODE_ENV || "production"

		// Intercept console logs from the extension and forward to LogService
		this.setupConsoleInterception()

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

		// Override console methods to forward to LogService ONLY (no console output)
		console.log = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			logService.info(message, "Extension")
		}

		console.error = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			logService.error(message, "Extension")
		}

		console.warn = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			logService.warn(message, "Extension")
		}

		console.debug = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			logService.debug(message, "Extension")
		}

		console.info = (...args: any[]) => {
			const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ")
			logService.info(message, "Extension")
		}

		logService.debug("Console interception setup complete", "ExtensionHost")
	}

	private restoreConsole(): void {
		if (this.originalConsole) {
			console.log = this.originalConsole.log
			console.error = this.originalConsole.error
			console.warn = this.originalConsole.warn
			console.debug = this.originalConsole.debug
			console.info = this.originalConsole.info
			this.originalConsole = null
			logService.debug("Console methods restored", "ExtensionHost")
		}
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

			logService.info("Extension activate function completed", "ExtensionHost")

			// Initialize state from extension
			this.initializeState()
		} catch (error) {
			logService.error("Extension activation failed", "ExtensionHost", { error })
			throw error
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
		}

		// Broadcast initial state
		setTimeout(() => {
			this.broadcastStateUpdate()
		}, 200)
	}

	private async handleWebviewLaunch(): Promise<void> {
		// Send initial state when webview launches
		this.broadcastStateUpdate()
	}

	private async handleNewTask(text: string, images?: string[]): Promise<void> {
		// Simulate task creation through the extension API
		if (this.extensionAPI && typeof this.extensionAPI.startNewTask === "function") {
			try {
				await this.extensionAPI.startNewTask({
					configuration: this.currentState?.apiConfiguration || {},
					text,
					images,
				})
			} catch (error) {
				logService.error("Error starting new task", "ExtensionHost", { error })
			}
		}
	}

	private async handleAskResponse(text: string): Promise<void> {
		// Handle user response to AI questions
		if (this.extensionAPI && typeof this.extensionAPI.sendMessage === "function") {
			try {
				await this.extensionAPI.sendMessage(text)
			} catch (error) {
				logService.error("Error sending ask response", "ExtensionHost", { error })
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

	private broadcastStateUpdate(): void {
		if (this.currentState) {
			const stateMessage: ExtensionMessage = {
				type: "state",
				state: this.currentState,
			}
			logService.debug("Broadcasting state update", "ExtensionHost")
			this.emit("message", stateMessage)
		}
	}

	private getAPI(): ExtensionAPI {
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
}

export function createExtensionHost(options: ExtensionHostOptions): ExtensionHost {
	return new ExtensionHost(options)
}
