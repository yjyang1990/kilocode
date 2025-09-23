import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { createVSCodeAPIMock } from "../host/VSCode.js"
import { resetSettingsService } from "../services/SettingsService.js"

describe("CLI Restart Integration", () => {
	let tempDir: string
	let workspacePath: string
	let extensionPath: string

	beforeEach(() => {
		// Create temporary directory for testing
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kilocode-cli-restart-test-"))
		workspacePath = path.join(tempDir, "workspace")
		extensionPath = path.join(tempDir, "extension")

		fs.mkdirSync(workspacePath, { recursive: true })
		fs.mkdirSync(extensionPath, { recursive: true })

		// Reset settings service singleton
		resetSettingsService()
	})

	afterEach(() => {
		// Clean up temporary directory
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
		resetSettingsService()
	})

	it("should persist API configuration across CLI restarts", async () => {
		// === First CLI Session ===
		// Use isolated global storage for this test
		process.env.HOME = tempDir
		const vscodeAPI1 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config1 = vscodeAPI1.workspace.getConfiguration("kilo-code")

		// Set some API configuration
		await config1.update("kilocodeToken", "test-token-12345")
		await config1.update("kilocodeModel", "claude-3-opus-20240229")
		await config1.update("allowedCommands", ["git status", "npm test", "ls -la"])
		await config1.update("diffEnabled", false)

		// Verify settings are set
		expect(config1.get("kilocodeToken")).toBe("test-token-12345")
		expect(config1.get("kilocodeModel")).toBe("claude-3-opus-20240229")
		expect(config1.get("allowedCommands")).toEqual(["git status", "npm test", "ls -la"])
		expect(config1.get("diffEnabled")).toBe(false)

		// === Simulate CLI Restart ===
		// Reset settings service to simulate restart
		resetSettingsService()

		// === Second CLI Session ===
		const vscodeAPI2 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config2 = vscodeAPI2.workspace.getConfiguration("kilo-code")

		// Wait for async initialization
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Verify settings persisted across restart
		expect(config2.get("kilocodeToken")).toBe("test-token-12345")
		expect(config2.get("kilocodeModel")).toBe("claude-3-opus-20240229")
		expect(config2.get("allowedCommands")).toEqual(["git status", "npm test", "ls -la"])
		expect(config2.get("diffEnabled")).toBe(false)

		// Verify we can still update settings in the new session
		await config2.update("kilocodeToken", "updated-token-67890")
		expect(config2.get("kilocodeToken")).toBe("updated-token-67890")

		// === Third CLI Session to verify the update persisted ===
		resetSettingsService()
		const vscodeAPI3 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config3 = vscodeAPI3.workspace.getConfiguration("kilo-code")

		// Wait for async initialization
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Verify the updated token persisted
		expect(config3.get("kilocodeToken")).toBe("updated-token-67890")
		expect(config3.get("kilocodeModel")).toBe("claude-3-opus-20240229")
	})

	it("should handle workspace-specific vs global settings correctly", async () => {
		// === First CLI Session ===
		// Use isolated global storage for this test
		process.env.HOME = tempDir
		const vscodeAPI1 = createVSCodeAPIMock(extensionPath, workspacePath)

		// Set global setting
		const globalConfig = vscodeAPI1.workspace.getConfiguration("kilo-code")
		await globalConfig.update("soundEnabled", true, vscodeAPI1.ConfigurationTarget.Global)

		// Set workspace-specific setting
		await globalConfig.update("diffEnabled", false, vscodeAPI1.ConfigurationTarget.Workspace)

		// === Simulate CLI Restart ===
		resetSettingsService(workspacePath)

		// === Second CLI Session (same workspace) ===
		const vscodeAPI2 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config2 = vscodeAPI2.workspace.getConfiguration("kilo-code")

		// Wait for async initialization
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Verify both global and workspace settings persisted
		expect(config2.get("soundEnabled")).toBe(true) // Global setting
		expect(config2.get("diffEnabled")).toBe(false) // Workspace setting

		// === Test with different workspace ===
		const newWorkspacePath = path.join(tempDir, "workspace2")
		fs.mkdirSync(newWorkspacePath, { recursive: true })

		resetSettingsService()
		const vscodeAPI3 = createVSCodeAPIMock(extensionPath, newWorkspacePath)
		const config3 = vscodeAPI3.workspace.getConfiguration("kilo-code")

		// Wait for async initialization
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Global setting should still be available
		expect(config3.get("soundEnabled")).toBe(true)

		// The diffEnabled setting should return the default value (true) in the new workspace
		// because the workspace-specific setting (false) only applies to the original workspace
		// This demonstrates proper workspace isolation
		expect(config3.get("diffEnabled")).toBe(true)

		// Let's test a truly workspace-specific setting by setting one that doesn't have a global default
		await config3.update("workspaceSpecificSetting", "workspace2-value", vscodeAPI3.ConfigurationTarget.Workspace)
		expect(config3.get("workspaceSpecificSetting")).toBe("workspace2-value")

		// Now go back to the original workspace and verify the workspace-specific setting is not there
		resetSettingsService(newWorkspacePath)
		const vscodeAPI4 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config4 = vscodeAPI4.workspace.getConfiguration("kilo-code")

		await new Promise((resolve) => setTimeout(resolve, 200))

		// The workspace-specific setting from workspace2 should not be available in workspace1
		expect(config4.get("workspaceSpecificSetting")).toBeUndefined()
	})

	it("should maintain settings file structure", async () => {
		// Use isolated global storage for this test
		process.env.HOME = tempDir
		const vscodeAPI = createVSCodeAPIMock(extensionPath, workspacePath)
		const config = vscodeAPI.workspace.getConfiguration("kilo-code")

		// Set various types of settings
		await config.update("kilocodeToken", "file-structure-test")
		await config.update("allowedCommands", ["git log", "git status"])
		await config.update("diffEnabled", true)

		// Wait for file operations to complete
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Verify settings files were created
		const globalSettingsPath = path.join(tempDir, ".kilocode-cli", "config", "global-settings.json")

		const workspaceSettingsPath = path.join(workspacePath, ".kilocode-cli", "config", "workspace-settings.json")

		// At least one settings file should exist
		const globalExists = fs.existsSync(globalSettingsPath)
		const workspaceExists = fs.existsSync(workspaceSettingsPath)

		expect(globalExists || workspaceExists).toBe(true)

		// If global settings file exists, verify its content
		if (globalExists) {
			const content = JSON.parse(fs.readFileSync(globalSettingsPath, "utf-8"))
			expect(content).toHaveProperty("kilo-code.kilocodeToken", "file-structure-test")
		}
	})
})
