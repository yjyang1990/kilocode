import * as fs from "fs/promises"
import * as path from "path"
import { homedir } from "os"
import type { CLIConfig } from "./types.js"
import { DEFAULT_CONFIG } from "./defaults.js"
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
		const config = JSON.parse(content)

		// Validate config
		const validation = await validateConfig(config)
		if (!validation.valid) {
			logs.error("Invalid config file", "ConfigPersistence", { errors: validation.errors })
			throw new Error(`Invalid config: ${validation.errors?.join(", ")}`)
		}

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

export async function getConfigPath(): Promise<string> {
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
