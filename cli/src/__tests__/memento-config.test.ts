import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { createVSCodeAPIMock, ConfigurationTarget } from "../host/VSCode.js"

describe("MemoryMemento Configuration", () => {
	let tempDir: string
	let workspacePath: string
	let extensionPath: string

	beforeEach(() => {
		// Create temporary directory for testing
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kilocode-memento-test-"))
		workspacePath = path.join(tempDir, "workspace")
		extensionPath = path.join(tempDir, "extension")

		fs.mkdirSync(workspacePath, { recursive: true })
		fs.mkdirSync(extensionPath, { recursive: true })

		// Set isolated HOME for testing
		process.env.HOME = tempDir
	})

	afterEach(() => {
		// Clean up temporary directory
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
	})

	it("should persist configuration using MemoryMemento", async () => {
		// === First CLI Session ===
		const vscodeAPI1 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config1 = vscodeAPI1.workspace.getConfiguration("kilo-code")

		// Set some configuration
		await config1.update("kilocodeToken", "memento-test-token")
		await config1.update("diffEnabled", false, ConfigurationTarget.Global)
		await config1.update("workspaceSetting", "workspace-value", ConfigurationTarget.Workspace)

		// Verify settings are set
		expect(config1.get("kilocodeToken")).toBe("memento-test-token")
		expect(config1.get("diffEnabled")).toBe(false)
		expect(config1.get("workspaceSetting")).toBe("workspace-value")

		// === Simulate CLI Restart ===
		// Create new VSCode API mock (simulates restart)
		const vscodeAPI2 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config2 = vscodeAPI2.workspace.getConfiguration("kilo-code")

		// Verify settings persisted across restart
		expect(config2.get("kilocodeToken")).toBe("memento-test-token")
		expect(config2.get("diffEnabled")).toBe(false)
		expect(config2.get("workspaceSetting")).toBe("workspace-value")
	})

	it("should handle workspace isolation correctly", async () => {
		// === First workspace ===
		const vscodeAPI1 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config1 = vscodeAPI1.workspace.getConfiguration("kilo-code")

		// Set global and workspace settings
		await config1.update("globalSetting", "global-value", ConfigurationTarget.Global)
		await config1.update("workspaceSetting", "workspace1-value", ConfigurationTarget.Workspace)

		// === Second workspace ===
		const workspace2Path = path.join(tempDir, "workspace2")
		fs.mkdirSync(workspace2Path, { recursive: true })

		const vscodeAPI2 = createVSCodeAPIMock(extensionPath, workspace2Path)
		const config2 = vscodeAPI2.workspace.getConfiguration("kilo-code")

		// Global setting should be available
		expect(config2.get("globalSetting")).toBe("global-value")

		// Workspace setting should not be available (different workspace)
		expect(config2.get("workspaceSetting")).toBeUndefined()

		// Set workspace-specific setting in second workspace
		await config2.update("workspaceSetting", "workspace2-value", ConfigurationTarget.Workspace)
		expect(config2.get("workspaceSetting")).toBe("workspace2-value")

		// === Back to first workspace ===
		const vscodeAPI3 = createVSCodeAPIMock(extensionPath, workspacePath)
		const config3 = vscodeAPI3.workspace.getConfiguration("kilo-code")

		// Original workspace setting should still be there
		expect(config3.get("workspaceSetting")).toBe("workspace1-value")
		expect(config3.get("globalSetting")).toBe("global-value")
	})

	it("should verify file structure matches extension expectations", async () => {
		const vscodeAPI = createVSCodeAPIMock(extensionPath, workspacePath)
		const config = vscodeAPI.workspace.getConfiguration("kilo-code")

		// Set some configuration
		await config.update("testSetting", "file-structure-test")

		// Verify the files are created in the expected locations
		const globalStatePath = path.join(tempDir, ".kilocode-cli", "global-storage", "global-state.json")
		const workspaceStatePath = path.join(
			workspacePath,
			".kilocode-cli",
			"workspace-storage",
			"workspace-state.json",
		)

		// At least one should exist
		const globalExists = fs.existsSync(globalStatePath)
		const workspaceExists = fs.existsSync(workspaceStatePath)

		expect(globalExists || workspaceExists).toBe(true)

		// If global state exists, verify it contains our setting
		if (globalExists) {
			const content = JSON.parse(fs.readFileSync(globalStatePath, "utf-8"))
			expect(content).toHaveProperty("kilo-code.testSetting", "file-structure-test")
		}
	})
})
