import { EventEmitter } from "events"
import { Instance, render } from "ink"
import React from "react"
import { createExtensionHost, ExtensionHost } from "../host/ExtensionHost.js"
import { createMessageBridge, MessageBridge } from "../communication/ipc.js"
import { UI } from "../ui/UI.js"
import { Logo } from "../ui/components/Logo.js"
import { logs } from "../services/logs.js"
import { resolveExtensionPaths } from "../utils/extension-paths.js"
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
	private ui: Instance | null = null
	private options: CLIOptions
	private isInitialized = false
	private splashInstance: any = null

	constructor(options: CLIOptions = {}) {
		super()
		this.options = options

		// Resolve extension paths for production CLI
		const extensionPaths = resolveExtensionPaths()

		this.extensionHost = createExtensionHost({
			workspacePath: options.workspace || process.cwd(),
			extensionBundlePath: extensionPaths.extensionBundlePath,
			extensionRootPath: extensionPaths.extensionRootPath,
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
			logs.info("Extension host activated", "KiloCodeCLI")
			logs.debug("Extension API keys", "KiloCodeCLI", { apiKeys: Object.keys(api) })
			this.emit("extensionReady", api)
		})

		this.extensionHost.on("error", (error) => {
			logs.error("Extension host error", "KiloCodeCLI", { error })
			this.emit("error", error)
		})

		// Forward extension messages to TUI through message bridge
		this.extensionHost.on("message", (message: ExtensionMessage) => {
			logs.debug(`Extension message: ${message.type}`, "KiloCodeCLI")
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

	private showSplashScreen(): void {
		// Render splash screen immediately
		this.splashInstance = render(React.createElement(Logo))
	}

	private hideSplashScreen(): void {
		// Unmount splash screen
		if (this.splashInstance) {
			this.splashInstance.unmount()
			this.splashInstance = null
		}
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		try {
			// Show splash screen first
			this.showSplashScreen()

			logs.info("Initializing Kilo Code CLI...", "KiloCodeCLI")

			// Activate extension host
			await this.extensionHost.activate()

			this.isInitialized = true
			logs.info("Kilo Code CLI initialized successfully", "KiloCodeCLI")

			// Hide splash screen after initialization
			this.hideSplashScreen()
		} catch (error) {
			logs.error("Failed to initialize CLI", "KiloCodeCLI", { error })
			this.hideSplashScreen()
			throw error
		}
	}

	async start(): Promise<void> {
		await this.initialize()

		this.ui = render(
			React.createElement(UI, {
				options: {
					messageBridge: this.messageBridge,
					initialMode: this.options.mode || "code",
					workspace: this.options.workspace || process.cwd(),
					autoApprove: this.options.autoApprove || false,
				},
				onExit: () => this.dispose(),
			}),
		)

		await this.ui.waitUntilExit()
	}

	private async handleTUIRequest(message: any): Promise<void> {
		try {
			if (message.data.type === "webviewMessage") {
				// Forward webview message to extension host
				await this.extensionHost.sendWebviewMessage(message.data.payload)
			}
		} catch (error) {
			logs.error("Error handling TUI request", "KiloCodeCLI", { error })
		}
	}

	private async handleTUIMessage(data: any): Promise<any> {
		try {
			if (data.type === "webviewMessage") {
				const message = data.payload
				logs.debug(`Forwarding webview message to extension host: ${message.type}`, "KiloCodeCLI")

				// Forward the message to the extension host
				await this.extensionHost.sendWebviewMessage(message)

				// Return success response
				return { success: true }
			}

			return { success: true }
		} catch (error) {
			logs.error("Error handling TUI message", "KiloCodeCLI", { error })
			return { error: error instanceof Error ? error.message : "Unknown error" }
		}
	}

	private handleExtensionEvent(message: any): void {
		return
		// try {
		// 	if (message.data.type === "extensionMessage") {
		// 		// Forward extension message to TUI
		// 		if (this.tuiApp) {
		// 			this.tuiApp.handleExtensionMessage(message.data.payload)
		// 		}
		// 	}
		// } catch (error) {
		// 	logs.error("Error handling extension event", "KiloCodeCLI", { error })
		// }
	}

	async dispose(): Promise<void> {
		if (this.ui) {
			await this.ui.unmount()
			this.ui = null
		}

		this.messageBridge.dispose()
		await this.extensionHost.deactivate()

		this.removeAllListeners()
		process.exit(0)
	}
}
