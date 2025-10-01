import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { ExtensionHost } from "../host/ExtensionHost.js"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

describe("Multiple Profiles Support", () => {
	let tempDir: string
	let extensionHost: ExtensionHost
	let extensionPath: string
	let binUnpackedPath: string

	beforeEach(async () => {
		// Create unique temporary directory for each test
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `kilocode-profiles-test-${Date.now()}-`))
		extensionPath = path.join(tempDir, "extension")
		binUnpackedPath = path.join(tempDir, "bin")

		// Set isolated HOME for testing to avoid cross-test contamination
		process.env.HOME = tempDir

		// Create necessary directories
		fs.mkdirSync(extensionPath, { recursive: true })
		fs.mkdirSync(path.join(binUnpackedPath, "dist"), { recursive: true })

		// Create a mock extension.js file
		const mockExtension = `
			module.exports = {
				activate: function(context) {
					return {
						startNewTask: () => Promise.resolve(),
						sendMessage: () => Promise.resolve(),
						cancelTask: () => Promise.resolve(),
						condense: () => Promise.resolve(),
						condenseTaskContext: () => Promise.resolve(),
						handleTerminalOperation: () => Promise.resolve(),
						getState: () => null
					}
				},
				deactivate: function() {}
			}
		`
		fs.writeFileSync(path.join(binUnpackedPath, "dist", "extension.js"), mockExtension)

		// Create ExtensionHost instance
		extensionHost = new ExtensionHost({
			workspacePath: tempDir,
			extensionBundlePath: path.join(binUnpackedPath, "dist", "extension.js"),
			extensionRootPath: binUnpackedPath,
		})

		// Activate the extension
		await extensionHost.activate()

		// Wait for initialization to complete
		await new Promise((resolve) => setTimeout(resolve, 300))
	})

	afterEach(async () => {
		// Clean up
		if (extensionHost) {
			await extensionHost.deactivate()
		}
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
		// Reset HOME environment variable
		delete process.env.HOME
	})

	it("should create default profile on first load", async () => {
		const api = extensionHost.getAPI()
		const state = api.getState()

		expect(state).toBeTruthy()
		expect(state?.currentApiConfigName).toBe("default")
		expect(state?.listApiConfigMeta).toBeTruthy()
		expect(state?.listApiConfigMeta?.length).toBe(1)
		expect(state?.listApiConfigMeta?.[0].name).toBe("default")
		expect(state?.apiConfiguration?.apiProvider).toBe("kilocode")
	})

	it("should persist and load multiple profiles", async () => {
		// Create a second profile
		await extensionHost.sendWebviewMessage({
			type: "upsertApiConfiguration",
			text: "anthropic-profile",
			apiConfiguration: {
				apiProvider: "anthropic",
				apiKey: "test-key",
				anthropicModel: "claude-3-sonnet-20240229",
			},
		})

		// Wait a bit for async operations
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Get current state
		let state = extensionHost.getAPI().getState()
		expect(state?.currentApiConfigName).toBe("anthropic-profile")
		expect(state?.listApiConfigMeta?.length).toBe(2)

		// Find the anthropic profile in the list
		const anthropicProfile = state?.listApiConfigMeta?.find((p) => p.name === "anthropic-profile")
		expect(anthropicProfile).toBeTruthy()
		expect(anthropicProfile?.apiProvider).toBe("anthropic")

		// Switch back to default profile
		await extensionHost.sendWebviewMessage({
			type: "loadApiConfiguration",
			text: "default",
		})

		// Wait a bit for async operations
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Verify we switched back
		state = extensionHost.getAPI().getState()
		expect(state?.currentApiConfigName).toBe("default")
		expect(state?.apiConfiguration?.apiProvider).toBe("kilocode")

		// Switch to anthropic profile
		await extensionHost.sendWebviewMessage({
			type: "loadApiConfiguration",
			text: "anthropic-profile",
		})

		// Wait a bit for async operations
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Verify we switched to anthropic
		state = extensionHost.getAPI().getState()
		expect(state?.currentApiConfigName).toBe("anthropic-profile")
		expect(state?.apiConfiguration?.apiProvider).toBe("anthropic")
		expect(state?.apiConfiguration?.apiKey).toBe("test-key")
	})

	it("should maintain profile list across extension restarts", async () => {
		// Create multiple profiles
		await extensionHost.sendWebviewMessage({
			type: "upsertApiConfiguration",
			text: "openai-profile",
			apiConfiguration: {
				apiProvider: "openai",
				openAiApiKey: "test-openai-key",
				openAiModelId: "gpt-4",
			},
		})

		await extensionHost.sendWebviewMessage({
			type: "upsertApiConfiguration",
			text: "anthropic-profile",
			apiConfiguration: {
				apiProvider: "anthropic",
				apiKey: "test-anthropic-key",
				anthropicModel: "claude-3-sonnet-20240229",
			},
		})

		// Wait for persistence
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Deactivate and reactivate extension (simulating restart)
		await extensionHost.deactivate()

		const newExtensionHost = new ExtensionHost({
			workspacePath: tempDir,
			extensionBundlePath: path.join(binUnpackedPath, "dist", "extension.js"),
			extensionRootPath: binUnpackedPath,
		})

		await newExtensionHost.activate()

		// Wait for loading
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Check that profiles are still available
		const state = newExtensionHost.getAPI().getState()
		expect(state?.listApiConfigMeta?.length).toBe(3) // default + openai + anthropic

		const profileNames = state?.listApiConfigMeta?.map((p) => p.name).sort()
		expect(profileNames).toEqual(["anthropic-profile", "default", "openai-profile"])

		// Clean up
		await newExtensionHost.deactivate()
	})
})
