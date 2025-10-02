import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import * as fs from "fs/promises"
import * as path from "path"
import { homedir } from "os"
import { loadConfig, saveConfig, ensureConfigDir, configExists } from "../persistence.js"
import { DEFAULT_CONFIG } from "../defaults.js"
import type { CLIConfig } from "../types.js"

// Mock the logs service
vi.mock("../../services/logs.js", () => ({
	logs: {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}))

const TEST_CONFIG_DIR = path.join(homedir(), ".kilocode", "cli-test")
const TEST_CONFIG_FILE = path.join(TEST_CONFIG_DIR, "config.json")

// Mock the config paths for testing
vi.mock("../persistence.js", async () => {
	const actual = await vi.importActual("../persistence.js")
	return {
		...actual,
		CONFIG_DIR: TEST_CONFIG_DIR,
		CONFIG_FILE: TEST_CONFIG_FILE,
	}
})

describe("Config Persistence", () => {
	beforeEach(async () => {
		// Clean up test directory before each test
		try {
			await fs.rm(TEST_CONFIG_DIR, { recursive: true, force: true })
		} catch {
			// Ignore if doesn't exist
		}
	})

	afterEach(async () => {
		// Clean up test directory after each test
		try {
			await fs.rm(TEST_CONFIG_DIR, { recursive: true, force: true })
		} catch {
			// Ignore if doesn't exist
		}
	})

	describe("ensureConfigDir", () => {
		it("should create config directory if it doesn't exist", async () => {
			await ensureConfigDir()
			const stats = await fs.stat(TEST_CONFIG_DIR)
			expect(stats.isDirectory()).toBe(true)
		})

		it("should not fail if directory already exists", async () => {
			await ensureConfigDir()
			await expect(ensureConfigDir()).resolves.not.toThrow()
		})
	})

	describe("loadConfig", () => {
		it("should create default config if file doesn't exist", async () => {
			const config = await loadConfig()
			expect(config).toEqual(DEFAULT_CONFIG)
		})

		it("should load existing config from file", async () => {
			const testConfig: CLIConfig = {
				version: "1.0.0",
				mode: "architect",
				telemetry: true,
				provider: "test-provider",
				providers: [
					{
						id: "test-provider",
						provider: "anthropic",
						apiKey: "test-key",
						apiModelId: "claude-3-5-sonnet-20241022",
					},
				],
			}

			await saveConfig(testConfig)
			const loaded = await loadConfig()
			expect(loaded).toEqual(testConfig)
		})
	})

	describe("saveConfig", () => {
		it("should save config to file", async () => {
			const testConfig: CLIConfig = {
				version: "1.0.0",
				mode: "code",
				telemetry: false,
				provider: "test",
				providers: [
					{
						id: "test",
						provider: "kilocode",
						kilocodeToken: "test-token",
						kilocodeModel: "test-model",
					},
				],
			}

			await saveConfig(testConfig)
			const content = await fs.readFile(TEST_CONFIG_FILE, "utf-8")
			const parsed = JSON.parse(content)
			expect(parsed).toEqual(testConfig)
		})

		it("should format JSON with proper indentation", async () => {
			await saveConfig(DEFAULT_CONFIG)
			const content = await fs.readFile(TEST_CONFIG_FILE, "utf-8")
			expect(content).toContain("\n")
			expect(content).toContain("  ")
		})
	})

	describe("configExists", () => {
		it("should return false if config doesn't exist", async () => {
			const exists = await configExists()
			expect(exists).toBe(false)
		})

		it("should return true if config exists", async () => {
			await saveConfig(DEFAULT_CONFIG)
			const exists = await configExists()
			expect(exists).toBe(true)
		})
	})
})
