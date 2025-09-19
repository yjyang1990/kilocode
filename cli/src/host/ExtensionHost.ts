import { EventEmitter } from "events"
import * as path from "path"
import { createVSCodeAPIMock } from "./VSCode.js"
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

	constructor(options: ExtensionHostOptions) {
		super()
		this.options = options
	}

	async activate(): Promise<ExtensionAPI> {
		if (this.isActivated) {
			return this.getAPI()
		}

		try {
			console.log("[ExtensionHost] Activating real extension...")

			// Setup VSCode API mock
			await this.setupVSCodeAPIMock()

			// Load the real extension
			await this.loadExtension()

			// Activate the extension
			await this.activateExtension()

			this.isActivated = true
			console.log("[ExtensionHost] Real extension activated successfully")

			// Emit activation event
			this.emit("activated", this.getAPI())

			return this.getAPI()
		} catch (error) {
			console.error("[ExtensionHost] Failed to activate extension:", error)
			this.emit("error", error)
			throw error
		}
	}

	async deactivate(): Promise<void> {
		if (!this.isActivated) {
			return
		}

		try {
			console.log("[ExtensionHost] Deactivating real extension...")

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

			this.isActivated = false
			this.currentState = null
			this.extensionModule = null
			this.extensionAPI = null
			this.vscodeAPI = null
			this.webviewProviders.clear()
			this.removeAllListeners()

			console.log("[ExtensionHost] Real extension deactivated")
		} catch (error) {
			console.error("[ExtensionHost] Error during deactivation:", error)
			throw error
		}
	}

	async sendWebviewMessage(message: WebviewMessage): Promise<void> {
		try {
			console.log("[ExtensionHost] Processing webview message:", message.type)

			if (!this.isActivated || !this.extensionAPI) {
				console.warn("[ExtensionHost] Extension not activated, ignoring message")
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
					console.log("[ExtensionHost] Unhandled webview message type:", message.type)
			}
		} catch (error) {
			console.error("[ExtensionHost] Error handling webview message:", error)
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

		console.log("[ExtensionHost] VSCode API mock setup complete")
	}

	private async loadExtension(): Promise<void> {
		const extensionPath = path.join(this.options.binUnpackedPath, "dist", "extension.js")

		try {
			console.log("[ExtensionHost] Loading extension from:", extensionPath)

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

			console.log("[ExtensionHost] Extension module loaded successfully")
		} catch (error) {
			console.error("[ExtensionHost] Failed to load extension module:", error)
			throw new Error(`Failed to load extension: ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	private async activateExtension(): Promise<void> {
		try {
			console.log("[ExtensionHost] Calling extension activate function...")

			// Call the extension's activate function with our mocked context
			this.extensionAPI = await this.extensionModule.activate(this.vscodeAPI.context)

			console.log("[ExtensionHost] Extension activate function completed")

			// Initialize state from extension
			this.initializeState()
		} catch (error) {
			console.error("[ExtensionHost] Extension activation failed:", error)
			throw error
		}
	}

	private initializeState(): void {
		// Create initial state that matches the extension's expected structure
		this.currentState = {
			version: "1.0.0-cli-simple-real",
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
				console.error("[ExtensionHost] Error starting new task:", error)
			}
		}
	}

	private async handleAskResponse(text: string): Promise<void> {
		// Handle user response to AI questions
		if (this.extensionAPI && typeof this.extensionAPI.sendMessage === "function") {
			try {
				await this.extensionAPI.sendMessage(text)
			} catch (error) {
				console.error("[ExtensionHost] Error sending ask response:", error)
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
			console.log("[ExtensionHost] Broadcasting state update")
			this.emit("message", stateMessage)
		}
	}

	private getAPI(): ExtensionAPI {
		return {
			getState: () => this.currentState,
			sendMessage: (message: ExtensionMessage) => {
				console.log("[ExtensionHost] Sending message:", message.type)
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
