import { render, Instance } from "ink"
import React from "react"
import { createStore } from "jotai"
import { createExtensionService, ExtensionService } from "./services/extension.js"
import { App } from "./ui/App.js"
import { Logo } from "./ui/assets/Logo.js"
import { logs } from "./services/logs.js"
import { extensionServiceAtom } from "./state/atoms/service.js"
import { initializeServiceEffectAtom } from "./state/atoms/effects.js"

export interface CLIOptions {
	mode?: string
	workspace?: string
	config?: string
	autoApprove?: boolean
}

/**
 * Main application class that orchestrates the CLI lifecycle
 */
export class CLI {
	private service: ExtensionService | null = null
	private store: ReturnType<typeof createStore> | null = null
	private ui: Instance | null = null
	private splashInstance: Instance | null = null
	private options: CLIOptions
	private isInitialized = false

	constructor(options: CLIOptions = {}) {
		this.options = options
	}

	/**
	 * Show splash screen during initialization
	 */
	private showSplashScreen(): void {
		this.splashInstance = render(React.createElement(Logo))
	}

	/**
	 * Hide splash screen after initialization
	 */
	private hideSplashScreen(): void {
		if (this.splashInstance) {
			this.splashInstance.unmount()
			this.splashInstance = null
		}
	}

	/**
	 * Initialize the application
	 * - Creates ExtensionService
	 * - Sets up Jotai store
	 * - Initializes service through effects
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			logs.warn("Application already initialized", "CLI")
			return
		}

		try {
			// Show splash screen
			this.showSplashScreen()

			logs.info("Initializing Kilo Code CLI...", "CLI")

			// Create Jotai store
			this.store = createStore()
			logs.debug("Jotai store created", "CLI")

			// Create ExtensionService
			this.service = createExtensionService({
				workspace: this.options.workspace || process.cwd(),
				mode: this.options.mode || "code",
				autoApprove: this.options.autoApprove || false,
			})
			logs.debug("ExtensionService created", "CLI")

			// Set service in store
			this.store.set(extensionServiceAtom, this.service)
			logs.debug("ExtensionService set in store", "CLI")

			// Initialize service through effect atom
			// This sets up all event listeners and activates the extension
			await this.store.set(initializeServiceEffectAtom, this.store)
			logs.info("ExtensionService initialized through effects", "CLI")

			this.isInitialized = true
			logs.info("Kilo Code CLI initialized successfully", "CLI")

			// Hide splash screen
			this.hideSplashScreen()
		} catch (error) {
			logs.error("Failed to initialize CLI", "CLI", { error })
			this.hideSplashScreen()
			throw error
		}
	}

	/**
	 * Start the application
	 * - Initializes if not already done
	 * - Renders the UI
	 * - Waits for exit
	 */
	async start(): Promise<void> {
		// Initialize if not already done
		if (!this.isInitialized) {
			await this.initialize()
		}

		if (!this.store) {
			throw new Error("Store not initialized")
		}

		// Render UI with store
		this.ui = render(
			React.createElement(App, {
				store: this.store,
				options: {
					initialMode: this.options.mode || "code",
					workspace: this.options.workspace || process.cwd(),
					autoApprove: this.options.autoApprove || false,
				},
				onExit: () => this.dispose(),
			}),
		)

		// Wait for UI to exit
		await this.ui.waitUntilExit()
	}

	/**
	 * Dispose the application and clean up resources
	 * - Unmounts UI
	 * - Disposes service
	 * - Cleans up store
	 */
	async dispose(): Promise<void> {
		try {
			logs.info("Disposing Kilo Code CLI...", "CLI")

			// Unmount UI
			if (this.ui) {
				await this.ui.unmount()
				this.ui = null
			}

			// Dispose service
			if (this.service) {
				await this.service.dispose()
				this.service = null
			}

			// Clear store reference
			this.store = null

			this.isInitialized = false
			logs.info("Kilo Code CLI disposed", "CLI")

			// Exit process
			process.exit(0)
		} catch (error) {
			logs.error("Error disposing CLI", "CLI", { error })
			process.exit(1)
		}
	}

	/**
	 * Get the ExtensionService instance
	 */
	getService(): ExtensionService | null {
		return this.service
	}

	/**
	 * Get the Jotai store instance
	 */
	getStore(): ReturnType<typeof createStore> | null {
		return this.store
	}

	/**
	 * Check if the application is initialized
	 */
	isReady(): boolean {
		return this.isInitialized
	}
}
