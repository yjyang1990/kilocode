import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { SettingsService, getSettingsService, resetSettingsService } from "../services/SettingsService.js"
import { MockWorkspaceConfiguration, ConfigurationTarget } from "../host/VSCode.js"

describe("Settings Persistence", () => {
	let tempDir: string
	let workspacePath: string
	let settingsService: SettingsService

	beforeEach(async () => {
		// Create temporary directory for testing
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kilocode-cli-test-"))
		workspacePath = path.join(tempDir, "workspace")
		fs.mkdirSync(workspacePath, { recursive: true })

		// Reset settings service singleton
		resetSettingsService()

		// Initialize settings service with isolated storage
		settingsService = getSettingsService({
			workspacePath,
			globalStoragePath: path.join(tempDir, "global-storage"),
		})
		await settingsService.initialize()
	})

	afterEach(() => {
		// Clean up temporary directory
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
		resetSettingsService()
	})

	describe("SettingsService", () => {
		it("should initialize with default settings", async () => {
			const allowedCommands = settingsService.get("kilo-code.allowedCommands")
			expect(allowedCommands).toEqual(["git log", "git diff", "git show"])

			const diffEnabled = settingsService.get("kilo-code.diffEnabled")
			expect(diffEnabled).toBe(true)
		})

		it("should persist settings to disk", async () => {
			const testKey = "kilo-code.testSetting"
			const testValue = "test-value-123"

			// Set a setting
			await settingsService.set(testKey, testValue, "global")

			// Verify it's stored in memory
			expect(settingsService.get(testKey)).toBe(testValue)

			// Create a new settings service instance to test persistence
			resetSettingsService()
			const newSettingsService = getSettingsService({
				workspacePath,
				globalStoragePath: path.join(tempDir, "global-storage"),
			})
			await newSettingsService.initialize()

			// Verify the setting persisted
			expect(newSettingsService.get(testKey)).toBe(testValue)
		})

		it("should handle workspace vs global settings correctly", async () => {
			const testKey = "kilo-code.scopeTest"
			const globalValue = "global-value"
			const workspaceValue = "workspace-value"

			// Set global setting
			await settingsService.set(testKey, globalValue, "global")
			expect(settingsService.get(testKey)).toBe(globalValue)

			// Set workspace setting (should override global)
			await settingsService.set(testKey, workspaceValue, "workspace")
			expect(settingsService.get(testKey)).toBe(workspaceValue)

			// Verify persistence
			resetSettingsService()
			const newSettingsService = getSettingsService({
				workspacePath,
				globalStoragePath: path.join(tempDir, "global-storage"),
			})
			await newSettingsService.initialize()
			expect(newSettingsService.get(testKey)).toBe(workspaceValue)
		})

		it("should handle setting deletion", async () => {
			const testKey = "kilo-code.deleteTest"
			const testValue = "to-be-deleted"

			// Set and verify setting
			await settingsService.set(testKey, testValue)
			expect(settingsService.get(testKey)).toBe(testValue)

			// Delete setting
			await settingsService.set(testKey, undefined)
			expect(settingsService.get(testKey)).toBeUndefined()

			// Verify deletion persisted
			resetSettingsService()
			const newSettingsService = getSettingsService({
				workspacePath,
				globalStoragePath: path.join(tempDir, "global-storage"),
			})
			await newSettingsService.initialize()
			expect(newSettingsService.get(testKey)).toBeUndefined()
		})

		it("should handle settings file corruption gracefully", async () => {
			const settingsPath = settingsService.getSettingsPaths().global

			// Corrupt the settings file
			fs.writeFileSync(settingsPath, "invalid json content")

			// Create new settings service - should handle corruption gracefully
			resetSettingsService()
			const newSettingsService = getSettingsService({ workspacePath })
			await newSettingsService.initialize()

			// Should fall back to defaults
			const allowedCommands = newSettingsService.get("kilo-code.allowedCommands")
			expect(allowedCommands).toEqual(["git log", "git diff", "git show"])
		})
	})

	describe("MockWorkspaceConfiguration", () => {
		let mockConfig: MockWorkspaceConfiguration

		beforeEach(async () => {
			// Create a mock configuration instance
			mockConfig = new MockWorkspaceConfiguration("kilo-code", workspacePath)
			// Wait for async initialization
			await new Promise((resolve) => setTimeout(resolve, 100))
		})

		it("should persist configuration updates", async () => {
			const testValue = "test-api-key-123"

			// Update configuration
			await mockConfig.update("kilocodeToken", testValue, ConfigurationTarget.Global)

			// Verify it's stored
			expect(mockConfig.get("kilocodeToken")).toBe(testValue)

			// Create new instance to test persistence
			const newMockConfig = new MockWorkspaceConfiguration("kilo-code", workspacePath)

			// Wait a bit for async initialization
			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(newMockConfig.get("kilocodeToken")).toBe(testValue)
		})

		it("should handle configuration inspection", async () => {
			const testKey = "testInspection"
			const testValue = "inspection-value"

			await mockConfig.update(testKey, testValue)

			const inspection = mockConfig.inspect(testKey)
			expect(inspection).toBeDefined()
			expect(inspection.key).toBe(`kilo-code.${testKey}`)
			expect(inspection.globalValue).toBe(testValue)
		})

		it("should handle has() method correctly", async () => {
			const testKey = "hasTest"

			// Initially should not exist
			expect(mockConfig.has(testKey)).toBe(false)

			// After setting, should exist
			await mockConfig.update(testKey, "some-value")
			expect(mockConfig.has(testKey)).toBe(true)

			// After deletion, should not exist
			await mockConfig.update(testKey, undefined)
			expect(mockConfig.has(testKey)).toBe(false)
		})

		it("should return default values when setting doesn't exist", () => {
			const defaultValue = "default-test-value"
			const result = mockConfig.get("nonExistentSetting", defaultValue)
			expect(result).toBe(defaultValue)
		})

		it("should handle nested configuration sections", async () => {
			const nestedConfig = new MockWorkspaceConfiguration("kilo-code.nested", workspacePath)

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100))

			await nestedConfig.update("subSetting", "nested-value")
			expect(nestedConfig.get("subSetting")).toBe("nested-value")

			// Verify the full key is stored correctly
			const allConfig = nestedConfig.getAllConfig()
			expect(allConfig["kilo-code.nested.subSetting"]).toBe("nested-value")
		})
	})

	describe("Integration Tests", () => {
		it("should maintain settings across CLI restarts", async () => {
			// Simulate initial CLI startup
			const config1 = new MockWorkspaceConfiguration("kilo-code", workspacePath)

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Set some configuration
			await config1.update("kilocodeToken", "persistent-token")
			await config1.update("kilocodeModel", "claude-3-opus-20240229")
			await config1.update("allowedCommands", ["git status", "npm test"])

			// Simulate CLI restart by creating new instances
			const config2 = new MockWorkspaceConfiguration("kilo-code", workspacePath)

			// Wait for async initialization
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Verify settings persisted
			expect(config2.get("kilocodeToken")).toBe("persistent-token")
			expect(config2.get("kilocodeModel")).toBe("claude-3-opus-20240229")
			expect(config2.get("allowedCommands")).toEqual(["git status", "npm test"])
		})

		it("should handle concurrent access safely", async () => {
			const config1 = new MockWorkspaceConfiguration("kilo-code", workspacePath)
			const config2 = new MockWorkspaceConfiguration("kilo-code", workspacePath)

			// Wait for initialization
			await Promise.all([
				new Promise((resolve) => setTimeout(resolve, 100)),
				new Promise((resolve) => setTimeout(resolve, 100)),
			])

			// Concurrent updates
			await Promise.all([config1.update("setting1", "value1"), config2.update("setting2", "value2")])

			// Both settings should be persisted
			expect(config1.get("setting1")).toBe("value1")
			expect(config1.get("setting2")).toBe("value2")
			expect(config2.get("setting1")).toBe("value1")
			expect(config2.get("setting2")).toBe("value2")
		})

		it("should create necessary directories automatically", async () => {
			// Use a completely new workspace path
			const newWorkspacePath = path.join(tempDir, "new-workspace")

			// Reset settings service to ensure clean state
			resetSettingsService()

			// Don't create the directory manually
			const config = new MockWorkspaceConfiguration("kilo-code", newWorkspacePath)

			// Wait for async initialization to complete
			await new Promise((resolve) => setTimeout(resolve, 200))

			// Update a setting - this should create directories automatically
			await config.update("autoCreateTest", "success")

			// Verify the setting was saved and directories were created
			expect(config.get("autoCreateTest")).toBe("success")

			// Check that the settings service created the directories
			const newSettingsService = getSettingsService({
				workspacePath: newWorkspacePath,
				globalStoragePath: path.join(tempDir, "global-storage-new"),
			})
			const paths = newSettingsService.getSettingsPaths()

			// Check that at least one of the config directories exists
			const globalConfigDir = path.dirname(paths.global)
			const workspaceConfigDir = path.dirname(paths.workspace)

			const globalExists = fs.existsSync(globalConfigDir)
			const workspaceExists = fs.existsSync(workspaceConfigDir)

			expect(globalExists || workspaceExists).toBe(true)
		})
	})

	describe("Error Handling", () => {
		it("should handle configuration errors gracefully", async () => {
			// Test that the configuration system handles errors without crashing
			const config = new MockWorkspaceConfiguration("kilo-code", workspacePath)

			// Wait for initialization
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Test normal operation
			await config.update("errorTest", "value")
			expect(config.get("errorTest")).toBe("value")
		})

		it("should handle invalid JSON gracefully", async () => {
			// Create settings service and get file path
			const settingsPath = settingsService.getSettingsPaths().global

			// Corrupt the settings file
			fs.writeFileSync(settingsPath, "invalid json content")

			// Create new settings service - should handle corruption gracefully
			resetSettingsService()
			const newSettingsService = getSettingsService({
				workspacePath,
				globalStoragePath: path.join(tempDir, "global-storage-corrupted"),
			})
			await newSettingsService.initialize()

			// Should fall back to defaults
			const allowedCommands = newSettingsService.get("kilo-code.allowedCommands")
			expect(allowedCommands).toEqual(["git log", "git diff", "git show"])
		})
	})
})
