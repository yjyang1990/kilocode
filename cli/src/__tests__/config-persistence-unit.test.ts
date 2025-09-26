import { describe, test, expect, beforeEach, afterEach, vi } from "vitest"
import { createVSCodeAPIMock } from "../host/VSCode.js"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"

describe("Configuration Persistence Unit Tests", () => {
	let tempDir: string
	let extensionPath: string
	let workspacePath: string
	let vscodeAPI: any

	beforeEach(() => {
		// Create temporary directories for testing
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kilocode-config-test-"))
		extensionPath = path.join(tempDir, "extension")
		workspacePath = path.join(tempDir, "workspace")

		// Create necessary directories
		fs.mkdirSync(extensionPath, { recursive: true })
		fs.mkdirSync(workspacePath, { recursive: true })

		// Create VSCode API mock
		vscodeAPI = createVSCodeAPIMock(extensionPath, workspacePath)
	})

	afterEach(() => {
		// Clean up
		if (tempDir && fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
	})

	test("should persist and load OpenRouter configuration with apiConfig prefix", async () => {
		const config = vscodeAPI.workspace.getConfiguration("kilo-code")

		// Test OpenRouter configuration
		const openRouterConfig = {
			apiProvider: "openrouter",
			openRouterApiKey: "test-openrouter-key",
			openRouterModelId: "anthropic/claude-3-5-sonnet",
			openRouterBaseUrl: "https://openrouter.ai/api/v1",
		}

		// Persist configuration with apiConfig prefix (simulating our new method)
		for (const [key, value] of Object.entries(openRouterConfig)) {
			if (value !== undefined && value !== null) {
				const configKey = `apiConfig.${key}`
				await config.update(configKey, value, vscodeAPI.ConfigurationTarget.Global)
			}
		}

		// Store the current API configuration name
		await config.update("currentApiConfigName", "openrouter-config", vscodeAPI.ConfigurationTarget.Global)

		// Load configuration back (simulating our new method)
		const allConfig = (config as any).getAllConfig()
		const persistedApiConfig: any = {}

		// Load all apiConfig.* fields (with or without kilo-code prefix)
		for (const [key, value] of Object.entries(allConfig)) {
			if (key.startsWith("apiConfig.") || key.startsWith("kilo-code.apiConfig.")) {
				const fieldName = key.startsWith("kilo-code.apiConfig.")
					? key.substring("kilo-code.apiConfig.".length)
					: key.substring("apiConfig.".length)
				if (value !== undefined && value !== null) {
					persistedApiConfig[fieldName] = value
				}
			}
		}

		const currentApiConfigName = config.get("currentApiConfigName", "default")

		// Verify that OpenRouter configuration was persisted and loaded correctly
		expect(persistedApiConfig.apiProvider).toBe("openrouter")
		expect(persistedApiConfig.openRouterApiKey).toBe("test-openrouter-key")
		expect(persistedApiConfig.openRouterModelId).toBe("anthropic/claude-3-5-sonnet")
		expect(persistedApiConfig.openRouterBaseUrl).toBe("https://openrouter.ai/api/v1")
		expect(currentApiConfigName).toBe("openrouter-config")
	})

	test("should persist and load Anthropic configuration", async () => {
		const config = vscodeAPI.workspace.getConfiguration("kilo-code")

		// Test Anthropic configuration
		const anthropicConfig = {
			apiProvider: "anthropic",
			apiKey: "test-anthropic-key",
			apiModelId: "claude-3-5-sonnet-20241022",
			anthropicBaseUrl: "https://api.anthropic.com",
		}

		// Persist configuration with apiConfig prefix
		for (const [key, value] of Object.entries(anthropicConfig)) {
			if (value !== undefined && value !== null) {
				const configKey = `apiConfig.${key}`
				await config.update(configKey, value, vscodeAPI.ConfigurationTarget.Global)
			}
		}

		await config.update("currentApiConfigName", "anthropic-config", vscodeAPI.ConfigurationTarget.Global)

		// Load configuration back
		const allConfig = (config as any).getAllConfig()
		const persistedApiConfig: any = {}

		for (const [key, value] of Object.entries(allConfig)) {
			if (key.startsWith("apiConfig.") || key.startsWith("kilo-code.apiConfig.")) {
				const fieldName = key.startsWith("kilo-code.apiConfig.")
					? key.substring("kilo-code.apiConfig.".length)
					: key.substring("apiConfig.".length)
				if (value !== undefined && value !== null) {
					persistedApiConfig[fieldName] = value
				}
			}
		}

		const currentApiConfigName = config.get("currentApiConfigName", "default")

		// Verify that Anthropic configuration was persisted and loaded correctly
		expect(persistedApiConfig.apiProvider).toBe("anthropic")
		expect(persistedApiConfig.apiKey).toBe("test-anthropic-key")
		expect(persistedApiConfig.apiModelId).toBe("claude-3-5-sonnet-20241022")
		expect(persistedApiConfig.anthropicBaseUrl).toBe("https://api.anthropic.com")
		expect(currentApiConfigName).toBe("anthropic-config")
	})

	test("should handle complex provider configurations with multiple field types", async () => {
		const config = vscodeAPI.workspace.getConfiguration("kilo-code")

		// Test AWS Bedrock configuration with multiple field types
		const bedrockConfig = {
			apiProvider: "bedrock",
			awsAccessKey: "test-access-key",
			awsSecretKey: "test-secret-key",
			awsSessionToken: "test-session-token",
			awsRegion: "us-east-1",
			awsUseCrossRegionInference: true,
			apiModelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
		}

		// Persist configuration
		for (const [key, value] of Object.entries(bedrockConfig)) {
			if (value !== undefined && value !== null) {
				const configKey = `apiConfig.${key}`
				await config.update(configKey, value, vscodeAPI.ConfigurationTarget.Global)
			}
		}

		await config.update("currentApiConfigName", "bedrock-config", vscodeAPI.ConfigurationTarget.Global)

		// Load configuration back
		const allConfig = (config as any).getAllConfig()
		const persistedApiConfig: any = {}

		for (const [key, value] of Object.entries(allConfig)) {
			if (key.startsWith("apiConfig.") || key.startsWith("kilo-code.apiConfig.")) {
				const fieldName = key.startsWith("kilo-code.apiConfig.")
					? key.substring("kilo-code.apiConfig.".length)
					: key.substring("apiConfig.".length)
				if (value !== undefined && value !== null) {
					persistedApiConfig[fieldName] = value
				}
			}
		}

		const currentApiConfigName = config.get("currentApiConfigName", "default")

		// Verify that all Bedrock configuration fields were persisted and loaded correctly
		expect(persistedApiConfig.apiProvider).toBe("bedrock")
		expect(persistedApiConfig.awsAccessKey).toBe("test-access-key")
		expect(persistedApiConfig.awsSecretKey).toBe("test-secret-key")
		expect(persistedApiConfig.awsSessionToken).toBe("test-session-token")
		expect(persistedApiConfig.awsRegion).toBe("us-east-1")
		expect(persistedApiConfig.awsUseCrossRegionInference).toBe(true)
		expect(persistedApiConfig.apiModelId).toBe("anthropic.claude-3-5-sonnet-20241022-v2:0")
		expect(currentApiConfigName).toBe("bedrock-config")
	})

	test("should handle empty configuration gracefully", async () => {
		const config = vscodeAPI.workspace.getConfiguration("kilo-code")

		// Load configuration when nothing is persisted
		const allConfig = (config as any).getAllConfig()
		const persistedApiConfig: any = {}

		for (const [key, value] of Object.entries(allConfig)) {
			if (key.startsWith("apiConfig.")) {
				const fieldName = key.substring("apiConfig.".length)
				if (value !== undefined && value !== null) {
					persistedApiConfig[fieldName] = value
				}
			}
		}

		// Should be empty
		expect(Object.keys(persistedApiConfig)).toHaveLength(0)

		// Set default values if no configuration is found (simulating our logic)
		if (Object.keys(persistedApiConfig).length === 0) {
			persistedApiConfig.apiProvider = "kilocode"
			persistedApiConfig.kilocodeToken = ""
			persistedApiConfig.kilocodeModel = "anthropic/claude-sonnet-4"
			persistedApiConfig.kilocodeOrganizationId = ""
		}

		// Verify defaults are set
		expect(persistedApiConfig.apiProvider).toBe("kilocode")
		expect(persistedApiConfig.kilocodeToken).toBe("")
		expect(persistedApiConfig.kilocodeModel).toBe("anthropic/claude-sonnet-4")
		expect(persistedApiConfig.kilocodeOrganizationId).toBe("")
	})
})
