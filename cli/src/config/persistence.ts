import * as fs from "fs/promises"
import * as path from "path"
import { homedir } from "os"
import type { CLIConfig, AutoApprovalConfig } from "./types.js"
import { DEFAULT_CONFIG, DEFAULT_AUTO_APPROVAL } from "./defaults.js"
import { validateConfig } from "./validation.js"
import { logs } from "../services/logs.js"

export const CONFIG_DIR = path.join(homedir(), ".kilocode", "cli")
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

// Allow overriding paths for testing
let configDir = CONFIG_DIR
let configFile = CONFIG_FILE

export function setConfigPaths(dir: string, file: string): void {
	configDir = dir
	configFile = file
}

export function resetConfigPaths(): void {
	configDir = CONFIG_DIR
	configFile = CONFIG_FILE
}

export async function ensureConfigDir(): Promise<void> {
	try {
		await fs.mkdir(configDir, { recursive: true })
	} catch (error) {
		logs.error("Failed to create config directory", "ConfigPersistence", { error })
		throw error
	}
}

/**
 * Deep merge two objects, with source taking precedence
 * Used to fill in missing config keys with defaults
 * - Starts with all keys from target (defaults)
 * - Overwrites with values from source (user config) where they exist
 * - Recursively merges nested objects
 */
function deepMerge(target: any, source: any): any {
	// Start with a copy of target to get all default keys
	const result = { ...target }

	// Iterate over source keys to override defaults
	for (const key in source) {
		const sourceValue = source[key]
		const targetValue = result[key]

		if (sourceValue !== undefined) {
			// If both are objects (not arrays), merge recursively
			if (
				typeof sourceValue === "object" &&
				sourceValue !== null &&
				!Array.isArray(sourceValue) &&
				typeof targetValue === "object" &&
				targetValue !== null &&
				!Array.isArray(targetValue)
			) {
				// Recursively merge nested objects
				result[key] = deepMerge(targetValue, sourceValue)
			} else {
				// Otherwise, source value takes precedence
				result[key] = sourceValue
			}
		}
	}

	return result
}

/**
 * Merge loaded config with defaults to fill in missing keys
 */
function mergeWithDefaults(loadedConfig: Partial<CLIConfig>): CLIConfig {
	// Merge defaults with loaded config - loaded config takes precedence
	// deepMerge(target, source) where source overrides target
	const merged = deepMerge(DEFAULT_CONFIG, loadedConfig) as CLIConfig

	// Special handling for autoApproval to ensure all nested keys have defaults
	// while preserving user values
	if (loadedConfig.autoApproval) {
		merged.autoApproval = deepMerge(DEFAULT_AUTO_APPROVAL, loadedConfig.autoApproval) as AutoApprovalConfig
	} else {
		merged.autoApproval = DEFAULT_AUTO_APPROVAL
	}

	return merged
}

export async function loadConfig(): Promise<CLIConfig> {
	try {
		await ensureConfigDir()

		// Check if config file exists
		try {
			await fs.access(configFile)
		} catch {
			// File doesn't exist, create default
			await saveConfig(DEFAULT_CONFIG)
			return DEFAULT_CONFIG
		}

		// Read and parse config
		const content = await fs.readFile(configFile, "utf-8")
		const loadedConfig = JSON.parse(content)

		// Merge with defaults to fill in missing keys
		const config = mergeWithDefaults(loadedConfig)

		// Validate merged config
		const validation = await validateConfig(config)
		if (!validation.valid) {
			logs.error("Invalid config file", "ConfigPersistence", { errors: validation.errors })
			throw new Error(`Invalid config: ${validation.errors?.join(", ")}`)
		}

		// Save the merged config back to ensure all defaults are persisted
		await saveConfig(config)

		return config as CLIConfig
	} catch (error) {
		logs.error("Failed to load config", "ConfigPersistence", { error })
		// Return default config on error
		return DEFAULT_CONFIG
	}
}

export async function saveConfig(config: CLIConfig): Promise<void> {
	try {
		await ensureConfigDir()

		// Validate before saving
		const validation = await validateConfig(config)
		if (!validation.valid) {
			throw new Error(`Invalid config: ${validation.errors?.join(", ")}`)
		}

		// Write config with pretty formatting
		await fs.writeFile(configFile, JSON.stringify(config, null, 2))
		logs.debug("Config saved successfully", "ConfigPersistence")
	} catch (error) {
		logs.error("Failed to save config", "ConfigPersistence", { error })
		throw error
	}
}

export function getConfigPath(): string {
	return configFile
}

export async function configExists(): Promise<boolean> {
	try {
		await fs.access(configFile)
		return true
	} catch {
		return false
	}
}
