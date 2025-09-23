import * as fs from "fs"
import * as path from "path"
import { logService } from "./LogService.js"

export interface SettingsServiceOptions {
	workspacePath: string
	globalStoragePath?: string
}

export interface SettingsData {
	[key: string]: any
}

/**
 * Settings service that manages persistent configuration for the CLI
 * Provides both workspace-specific and global settings storage
 */
export class SettingsService {
	private workspaceSettingsPath: string
	private globalSettingsPath: string
	private workspaceSettings: SettingsData = {}
	private globalSettings: SettingsData = {}
	private isInitialized = false

	constructor(options: SettingsServiceOptions) {
		// Workspace-specific settings
		const workspaceConfigDir = path.join(options.workspacePath, ".kilocode-cli", "config")
		this.workspaceSettingsPath = path.join(workspaceConfigDir, "workspace-settings.json")

		// Global settings
		const globalConfigDir =
			options.globalStoragePath ||
			path.join(process.env.HOME || process.env.USERPROFILE || "/tmp", ".kilocode-cli", "config")
		this.globalSettingsPath = path.join(globalConfigDir, "global-settings.json")

		// Ensure directories exist immediately
		this.ensureDirectoriesExist()
	}

	private ensureDirectoriesExist(): void {
		try {
			// Create workspace config directory
			const workspaceDir = path.dirname(this.workspaceSettingsPath)
			if (!fs.existsSync(workspaceDir)) {
				fs.mkdirSync(workspaceDir, { recursive: true })
			}

			// Create global config directory
			const globalDir = path.dirname(this.globalSettingsPath)
			if (!fs.existsSync(globalDir)) {
				fs.mkdirSync(globalDir, { recursive: true })
			}
		} catch (error) {
			logService.warn("Failed to create settings directories", "SettingsService", { error })
		}
	}

	/**
	 * Initialize the settings service by loading existing settings
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return
		}

		try {
			await this.loadSettings()
			await this.migrate()
			this.isInitialized = true
			logService.info("Settings service initialized", "SettingsService")
		} catch (error) {
			logService.error("Failed to initialize settings service", "SettingsService", { error })
			throw error
		}
	}

	/**
	 * Load settings from disk
	 */
	private async loadSettings(): Promise<void> {
		// Load workspace settings
		try {
			if (fs.existsSync(this.workspaceSettingsPath)) {
				const content = fs.readFileSync(this.workspaceSettingsPath, "utf-8")
				this.workspaceSettings = JSON.parse(content)
				logService.debug(`Loaded workspace settings from ${this.workspaceSettingsPath}`, "SettingsService")
			} else {
				this.workspaceSettings = {}
			}
		} catch (error) {
			logService.warn(`Failed to load workspace settings from ${this.workspaceSettingsPath}`, "SettingsService", {
				error,
			})
			this.workspaceSettings = {}
		}

		// Load global settings
		try {
			if (fs.existsSync(this.globalSettingsPath)) {
				const content = fs.readFileSync(this.globalSettingsPath, "utf-8")
				this.globalSettings = JSON.parse(content)
				logService.debug(`Loaded global settings from ${this.globalSettingsPath}`, "SettingsService")
			} else {
				this.globalSettings = this.getDefaultGlobalSettings()
				await this.saveGlobalSettings()
			}
		} catch (error) {
			logService.warn(`Failed to load global settings from ${this.globalSettingsPath}`, "SettingsService", {
				error,
			})
			this.globalSettings = this.getDefaultGlobalSettings()
		}
	}

	/**
	 * Save workspace settings to disk
	 */
	private async saveWorkspaceSettings(): Promise<void> {
		try {
			const dir = path.dirname(this.workspaceSettingsPath)
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true })
			}

			fs.writeFileSync(this.workspaceSettingsPath, JSON.stringify(this.workspaceSettings, null, 2))
			logService.debug(`Saved workspace settings to ${this.workspaceSettingsPath}`, "SettingsService")
		} catch (error) {
			logService.error(`Failed to save workspace settings to ${this.workspaceSettingsPath}`, "SettingsService", {
				error,
			})
			throw error
		}
	}

	/**
	 * Save global settings to disk
	 */
	private async saveGlobalSettings(): Promise<void> {
		try {
			const dir = path.dirname(this.globalSettingsPath)
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true })
			}

			fs.writeFileSync(this.globalSettingsPath, JSON.stringify(this.globalSettings, null, 2))
			logService.debug(`Saved global settings to ${this.globalSettingsPath}`, "SettingsService")
		} catch (error) {
			logService.error(`Failed to save global settings to ${this.globalSettingsPath}`, "SettingsService", {
				error,
			})
			throw error
		}
	}

	/**
	 * Get default global settings
	 */
	private getDefaultGlobalSettings(): SettingsData {
		return {
			"kilo-code.allowedCommands": ["git log", "git diff", "git show"],
			"kilo-code.deniedCommands": [],
			"kilo-code.commandExecutionTimeout": 0,
			"kilo-code.customStoragePath": "",
			"kilo-code.alwaysAllowReadOnly": true,
			"kilo-code.alwaysAllowWrite": true,
			"kilo-code.alwaysAllowExecute": true,
			"kilo-code.autoCondenseContext": true,
			"kilo-code.diffEnabled": true,
			"kilo-code.enableCheckpoints": true,
			"kilo-code.soundEnabled": false,
			"kilo-code.ttsEnabled": false,
			"kilo-code.browserToolEnabled": true,
			"kilo-code.mcpEnabled": true,
			"kilo-code.telemetrySetting": "disabled",
			"kilo-code.language": "en",
		}
	}

	/**
	 * Get a setting value with proper fallback logic
	 * Priority: workspace settings > global settings > default value
	 */
	get<T>(key: string, defaultValue?: T): T | undefined {
		if (!this.isInitialized) {
			logService.warn("Settings service not initialized, returning default value", "SettingsService", { key })
			return defaultValue
		}

		// Check workspace settings first
		if (this.workspaceSettings[key] !== undefined) {
			return this.workspaceSettings[key]
		}

		// Check global settings
		if (this.globalSettings[key] !== undefined) {
			return this.globalSettings[key]
		}

		// Return default value
		return defaultValue
	}

	/**
	 * Set a setting value
	 */
	async set(key: string, value: any, scope: "workspace" | "global" = "global"): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		try {
			if (scope === "workspace") {
				if (value === undefined || value === null) {
					delete this.workspaceSettings[key]
				} else {
					this.workspaceSettings[key] = value
				}
				await this.saveWorkspaceSettings()
			} else {
				if (value === undefined || value === null) {
					delete this.globalSettings[key]
				} else {
					this.globalSettings[key] = value
				}
				await this.saveGlobalSettings()
			}

			logService.debug(`Setting updated: ${key} = ${JSON.stringify(value)} (${scope})`, "SettingsService")
		} catch (error) {
			logService.error(`Failed to set setting: ${key}`, "SettingsService", { error })
			throw error
		}
	}

	/**
	 * Check if a setting exists
	 */
	has(key: string): boolean {
		if (!this.isInitialized) {
			return false
		}

		return this.workspaceSettings[key] !== undefined || this.globalSettings[key] !== undefined
	}

	/**
	 * Get all settings (merged workspace and global)
	 */
	getAll(): SettingsData {
		if (!this.isInitialized) {
			return {}
		}

		return {
			...this.globalSettings,
			...this.workspaceSettings,
		}
	}

	/**
	 * Reset all settings to defaults
	 */
	async reset(scope?: "workspace" | "global"): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize()
		}

		try {
			if (!scope || scope === "workspace") {
				this.workspaceSettings = {}
				await this.saveWorkspaceSettings()
			}

			if (!scope || scope === "global") {
				this.globalSettings = this.getDefaultGlobalSettings()
				await this.saveGlobalSettings()
			}

			logService.info(`Settings reset (${scope || "all"})`, "SettingsService")
		} catch (error) {
			logService.error("Failed to reset settings", "SettingsService", { error })
			throw error
		}
	}

	/**
	 * Reload settings from disk
	 */
	async reload(): Promise<void> {
		try {
			await this.loadSettings()
			logService.debug("Settings reloaded from disk", "SettingsService")
		} catch (error) {
			logService.error("Failed to reload settings", "SettingsService", { error })
			throw error
		}
	}

	/**
	 * Get settings file paths for debugging
	 */
	getSettingsPaths(): { workspace: string; global: string } {
		return {
			workspace: this.workspaceSettingsPath,
			global: this.globalSettingsPath,
		}
	}

	/**
	 * Validate a setting value against expected type and constraints
	 */
	private validateSetting(key: string, value: any): boolean {
		try {
			switch (key) {
				case "kilo-code.allowedCommands":
				case "kilo-code.deniedCommands":
					return Array.isArray(value) && value.every((cmd) => typeof cmd === "string")

				case "kilo-code.commandExecutionTimeout":
				case "kilo-code.maxReadFileLine":
				case "kilo-code.maxImageFileSize":
				case "kilo-code.maxTotalImageSize":
					return typeof value === "number" && value >= 0

				case "kilo-code.customStoragePath":
				case "kilo-code.kilocodeToken":
				case "kilo-code.kilocodeModel":
				case "kilo-code.language":
					return typeof value === "string"

				case "kilo-code.alwaysAllowReadOnly":
				case "kilo-code.alwaysAllowWrite":
				case "kilo-code.alwaysAllowExecute":
				case "kilo-code.autoCondenseContext":
				case "kilo-code.diffEnabled":
				case "kilo-code.enableCheckpoints":
				case "kilo-code.soundEnabled":
				case "kilo-code.ttsEnabled":
				case "kilo-code.browserToolEnabled":
				case "kilo-code.mcpEnabled":
					return typeof value === "boolean"

				default:
					// Allow unknown settings but log a warning
					logService.debug(`Unknown setting key: ${key}`, "SettingsService")
					return true
			}
		} catch (error) {
			logService.warn(`Error validating setting ${key}`, "SettingsService", { error })
			return false
		}
	}

	/**
	 * Migrate settings from old format if needed
	 */
	async migrate(): Promise<void> {
		try {
			let migrationPerformed = false

			// Check for old CLI configuration files and migrate them
			const oldConfigPaths = [
				path.join(this.workspacePath || process.cwd(), ".kilocode", "config.json"),
				path.join(process.env.HOME || process.env.USERPROFILE || "/tmp", ".kilocode", "config.json"),
			]

			for (const oldPath of oldConfigPaths) {
				if (fs.existsSync(oldPath)) {
					try {
						const oldContent = fs.readFileSync(oldPath, "utf-8")
						const oldConfig = JSON.parse(oldContent)

						// Migrate old settings to new format
						for (const [key, value] of Object.entries(oldConfig)) {
							const newKey = key.startsWith("kilo-code.") ? key : `kilo-code.${key}`

							if (this.validateSetting(newKey, value)) {
								await this.set(newKey, value, "global")
								migrationPerformed = true
							} else {
								logService.warn(
									`Skipped invalid setting during migration: ${newKey}`,
									"SettingsService",
								)
							}
						}

						// Backup old file and remove it
						const backupPath = `${oldPath}.backup.${Date.now()}`
						fs.renameSync(oldPath, backupPath)
						logService.info(
							`Migrated settings from ${oldPath} (backed up to ${backupPath})`,
							"SettingsService",
						)
					} catch (error) {
						logService.warn(`Failed to migrate settings from ${oldPath}`, "SettingsService", { error })
					}
				}
			}

			// Validate current settings and fix any invalid values
			const allSettings = this.getAll()
			for (const [key, value] of Object.entries(allSettings)) {
				if (!this.validateSetting(key, value)) {
					logService.warn(`Invalid setting detected: ${key}, resetting to default`, "SettingsService")

					// Reset to default value
					const defaults = this.getDefaultGlobalSettings()
					const defaultValue = defaults[key]
					if (defaultValue !== undefined) {
						await this.set(key, defaultValue, "global")
						migrationPerformed = true
					} else {
						// Remove unknown invalid setting
						await this.set(key, undefined, "global")
						migrationPerformed = true
					}
				}
			}

			if (migrationPerformed) {
				logService.info("Settings migration completed", "SettingsService")
			} else {
				logService.debug("No settings migration needed", "SettingsService")
			}
		} catch (error) {
			logService.error("Settings migration failed", "SettingsService", { error })
		}
	}

	/**
	 * Validate all current settings
	 */
	async validateAllSettings(): Promise<{ valid: boolean; errors: string[] }> {
		const errors: string[] = []
		const allSettings = this.getAll()

		for (const [key, value] of Object.entries(allSettings)) {
			if (!this.validateSetting(key, value)) {
				errors.push(`Invalid setting: ${key} = ${JSON.stringify(value)}`)
			}
		}

		return {
			valid: errors.length === 0,
			errors,
		}
	}

	/**
	 * Get the workspace path (useful for migration)
	 */
	private get workspacePath(): string | undefined {
		return path.dirname(path.dirname(path.dirname(this.workspaceSettingsPath)))
	}
}

// Multiple instances for different workspaces
const settingsServiceInstances: Map<string, SettingsService> = new Map()

/**
 * Get or create the settings service instance for a specific workspace
 */
export function getSettingsService(options?: SettingsServiceOptions): SettingsService {
	if (!options) {
		throw new Error("SettingsService options required.")
	}

	const workspaceKey = options.workspacePath

	if (!settingsServiceInstances.has(workspaceKey)) {
		settingsServiceInstances.set(workspaceKey, new SettingsService(options))
	}

	return settingsServiceInstances.get(workspaceKey)!
}

/**
 * Reset the settings service instances (useful for testing)
 */
export function resetSettingsService(workspacePath?: string): void {
	if (workspacePath) {
		settingsServiceInstances.delete(workspacePath)
	} else {
		settingsServiceInstances.clear()
	}
}
