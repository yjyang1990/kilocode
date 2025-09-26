import { EventEmitter } from "events"
import * as path from "path"
import { createExtensionHost, ExtensionHost } from "../host/ExtensionHost.js"
import { createMessageBridge, MessageBridge } from "../communication/ipc.js"
import { TUIApplication } from "../tui/App.js"
import { logService } from "../services/LogService.js"
import type { ExtensionMessage, WebviewMessage, ExtensionState } from "../types/messages.js"

export interface CLIOptions {
	mode?: string
	workspace?: string
	config?: string
	autoApprove?: boolean
}

export class KiloCodeCLI extends EventEmitter {
	private extensionHost: ExtensionHost
	private messageBridge: MessageBridge
	private tuiApp: TUIApplication | null = null
	private options: CLIOptions
	private isInitialized = false

	constructor(options: CLIOptions = {}) {
		super()
		this.options = options

		// Initialize extension host
		const cwd = process.cwd()
		const isInCliDir = cwd.endsWith("/cli")
		const rootDir = isInCliDir ? path.join(cwd, "..") : cwd

		this.extensionHost = createExtensionHost({
			workspacePath: options.workspace || process.cwd(),
			extensionPath: path.join(rootDir, "src"),
			binUnpackedPath: path.join(rootDir, "bin-unpacked", "extension"),
		})

		// Initialize message bridge
		this.messageBridge = createMessageBridge({
			enableLogging: true, // Always enable logging for debugging
		})

		this.setupEventHandlers()
		// Remove this call for now - we'll handle message routing in setupEventHandlers
	}

	private setupEventHandlers(): void {
		// Extension host events
		this.extensionHost.on("activated", (api) => {
			logService.info("Extension host activated", "KiloCodeCLI")
			logService.debug("Extension API keys", "KiloCodeCLI", { apiKeys: Object.keys(api) })
			this.emit("extensionReady", api)
		})

		this.extensionHost.on("error", (error) => {
			logService.error("Extension host error", "KiloCodeCLI", { error })
			this.emit("error", error)
		})

		// Forward extension messages to TUI through message bridge
		this.extensionHost.on("message", (message: ExtensionMessage) => {
			logService.debug(`Extension message: ${message.type}`, "KiloCodeCLI")
			// Send extension message to TUI
			this.messageBridge.sendExtensionMessage(message)
		})

		// Message bridge events
		this.messageBridge.on("tuiRequest", async (message) => {
			await this.handleTUIRequest(message)
		})

		this.messageBridge.on("extensionEvent", (message) => {
			this.handleExtensionEvent(message)
		})

		// Set up proper message routing to avoid IPC timeouts
		this.messageBridge.getTUIChannel().on("message", async (ipcMessage) => {
			if (ipcMessage.type === "request") {
				// Handle TUI requests and respond immediately to avoid timeouts
				try {
					const response = await this.handleTUIMessage(ipcMessage.data)
					this.messageBridge.getExtensionChannel().respond(ipcMessage.id, response)
				} catch (error) {
					this.messageBridge.getExtensionChannel().respond(ipcMessage.id, {
						error: error instanceof Error ? error.message : "Unknown error",
					})
				}
			}
		})
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		try {
			logService.info("Initializing Kilo Code CLI...", "KiloCodeCLI")

			// Activate extension host
			await this.extensionHost.activate()

			// Initialize TUI application
			this.tuiApp = new TUIApplication({
				messageBridge: this.messageBridge,
				initialMode: this.options.mode || "code",
				workspace: this.options.workspace || process.cwd(),
				autoApprove: this.options.autoApprove || false,
			})

			this.isInitialized = true
			logService.info("Kilo Code CLI initialized successfully", "KiloCodeCLI")
		} catch (error) {
			logService.error("Failed to initialize CLI", "KiloCodeCLI", { error })
			throw error
		}
	}

	async startChatSession(): Promise<void> {
		await this.initialize()

		if (!this.tuiApp) {
			throw new Error("TUI application not initialized")
		}

		logService.info("Starting interactive chat session...", "KiloCodeCLI")
		await this.tuiApp.startChatMode()
	}

	async executeTask(message: string): Promise<void> {
		await this.initialize()

		if (!this.tuiApp) {
			throw new Error("TUI application not initialized")
		}

		logService.info(`Executing task: ${message}`, "KiloCodeCLI")
		await this.tuiApp.executeTask(message)
	}

	async showHistory(): Promise<void> {
		await this.initialize()

		if (!this.tuiApp) {
			throw new Error("TUI application not initialized")
		}

		logService.info("Showing task history...", "KiloCodeCLI")
		await this.tuiApp.showHistory()
	}

	async showSettings(): Promise<void> {
		await this.initialize()

		if (!this.tuiApp) {
			throw new Error("TUI application not initialized")
		}

		logService.info("Opening settings...", "KiloCodeCLI")
		await this.tuiApp.showSettings()
	}

	async showModes(): Promise<void> {
		await this.initialize()

		if (!this.tuiApp) {
			throw new Error("TUI application not initialized")
		}

		logService.info("Managing modes...", "KiloCodeCLI")
		await this.tuiApp.showModes()
	}

	async showMcp(): Promise<void> {
		await this.initialize()

		if (!this.tuiApp) {
			throw new Error("TUI application not initialized")
		}

		logService.info("Managing MCP servers...", "KiloCodeCLI")
		await this.tuiApp.showMcp()
	}

	private async handleTUIRequest(message: any): Promise<void> {
		try {
			if (message.data.type === "webviewMessage") {
				// Forward webview message to extension host
				await this.extensionHost.sendWebviewMessage(message.data.payload)
			}
		} catch (error) {
			logService.error("Error handling TUI request", "KiloCodeCLI", { error })
		}
	}

	private async handleTUIMessage(data: any): Promise<any> {
		try {
			if (data.type === "webviewMessage") {
				const message = data.payload
				logService.debug(`Forwarding webview message to extension host: ${message.type}`, "KiloCodeCLI")

				// Forward the message to the extension host
				await this.extensionHost.sendWebviewMessage(message)

				// Return success response
				return { success: true }
			}

			return { success: true }
		} catch (error) {
			logService.error("Error handling TUI message", "KiloCodeCLI", { error })
			return { error: error instanceof Error ? error.message : "Unknown error" }
		}
	}

	private handleExtensionEvent(message: any): void {
		try {
			if (message.data.type === "extensionMessage") {
				// Forward extension message to TUI
				if (this.tuiApp) {
					this.tuiApp.handleExtensionMessage(message.data.payload)
				}
			}
		} catch (error) {
			logService.error("Error handling extension event", "KiloCodeCLI", { error })
		}
	}

	async dispose(): Promise<void> {
		if (this.tuiApp) {
			await this.tuiApp.dispose()
			this.tuiApp = null
		}

		this.messageBridge.dispose()
		await this.extensionHost.deactivate()

		this.removeAllListeners()
		process.exit(0)
	}
}
