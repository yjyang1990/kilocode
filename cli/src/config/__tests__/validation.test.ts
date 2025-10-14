import { describe, it, expect, vi } from "vitest"
import { validateConfig, validateProviderConfig, validateSelectedProvider } from "../validation.js"
import type { CLIConfig, ProviderConfig } from "../types.js"

// Mock fs/promises
vi.mock("fs/promises", () => ({
	readFile: vi.fn().mockResolvedValue(
		JSON.stringify({
			type: "object",
			properties: {
				version: { type: "string" },
				mode: { type: "string" },
				telemetry: { type: "boolean" },
				provider: { type: "string" },
				providers: { type: "array" },
			},
			required: ["version", "mode", "telemetry", "provider", "providers"],
		}),
	),
}))

describe("validateProviderConfig", () => {
	it("should return error when provider type is missing", () => {
		const provider = { id: "test" } as ProviderConfig
		const result = validateProviderConfig(provider)
		expect(result.valid).toBe(false)
		expect(result.errors).toContain("Provider type is required")
	})

	describe("kilocode provider", () => {
		it("should validate valid kilocode provider (not selected)", () => {
			const provider: ProviderConfig = {
				id: "test-kilocode",
				provider: "kilocode",
				kilocodeToken: "valid-token-123",
				kilocodeModel: "claude-3-5-sonnet",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(true)
		})

		it("should allow empty credentials for non-selected provider", () => {
			const provider: ProviderConfig = {
				id: "test-kilocode",
				provider: "kilocode",
				kilocodeToken: "",
				kilocodeModel: "claude-3-5-sonnet",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(true)
		})

		it("should reject empty credentials for selected provider", () => {
			const provider: ProviderConfig = {
				id: "test-kilocode",
				provider: "kilocode",
				kilocodeToken: "",
				kilocodeModel: "claude-3-5-sonnet",
			}
			const result = validateProviderConfig(provider, true)
			expect(result.valid).toBe(false)
			expect(result.errors?.[0]).toContain("kilocodeToken is required and cannot be empty")
		})

		it("should return error for missing kilocodeToken", () => {
			const provider: ProviderConfig = {
				id: "test-kilocode",
				provider: "kilocode",
				kilocodeModel: "claude-3-5-sonnet",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors).toContain("kilocodeToken must be a string")
		})

		it("should return error for short kilocodeToken", () => {
			const provider: ProviderConfig = {
				id: "test-kilocode",
				provider: "kilocode",
				kilocodeToken: "short",
				kilocodeModel: "claude-3-5-sonnet",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors?.[0]).toContain("kilocodeToken must be at least 10 characters long")
		})

		it("should return error for missing kilocodeModel", () => {
			const provider: ProviderConfig = {
				id: "test-kilocode",
				provider: "kilocode",
				kilocodeToken: "valid-token-123",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors).toContain("kilocodeModel must be a string")
		})
	})

	describe("anthropic provider", () => {
		it("should validate valid anthropic provider", () => {
			const provider: ProviderConfig = {
				id: "test-anthropic",
				provider: "anthropic",
				apiKey: "sk-ant-valid-key-123",
				apiModelId: "claude-3-5-sonnet-20241022",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(true)
		})

		it("should allow empty credentials for non-selected provider", () => {
			const provider: ProviderConfig = {
				id: "test-anthropic",
				provider: "anthropic",
				apiKey: "",
				apiModelId: "claude-3-5-sonnet-20241022",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(true)
		})

		it("should reject empty credentials for selected provider", () => {
			const provider: ProviderConfig = {
				id: "test-anthropic",
				provider: "anthropic",
				apiKey: "",
				apiModelId: "claude-3-5-sonnet-20241022",
			}
			const result = validateProviderConfig(provider, true)
			expect(result.valid).toBe(false)
			expect(result.errors?.[0]).toContain("apiKey is required and cannot be empty")
		})

		it("should return error for missing apiKey", () => {
			const provider: ProviderConfig = {
				id: "test-anthropic",
				provider: "anthropic",
				apiModelId: "claude-3-5-sonnet-20241022",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors).toContain("apiKey must be a string")
		})

		it("should return error for short apiKey", () => {
			const provider: ProviderConfig = {
				id: "test-anthropic",
				provider: "anthropic",
				apiKey: "short",
				apiModelId: "claude-3-5-sonnet-20241022",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors?.[0]).toContain("apiKey must be at least 10 characters long")
		})
	})

	describe("openai-native provider", () => {
		it("should validate valid openai-native provider", () => {
			const provider: ProviderConfig = {
				id: "test-openai",
				provider: "openai-native",
				openAiNativeApiKey: "sk-valid-key-123",
				apiModelId: "gpt-4",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(true)
		})

		it("should return error for missing openAiNativeApiKey", () => {
			const provider: ProviderConfig = {
				id: "test-openai",
				provider: "openai-native",
				apiModelId: "gpt-4",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors).toContain("openAiNativeApiKey must be a string")
		})
	})

	describe("ollama provider", () => {
		it("should validate valid ollama provider", () => {
			const provider: ProviderConfig = {
				id: "test-ollama",
				provider: "ollama",
				ollamaBaseUrl: "http://localhost:11434",
				ollamaModelId: "llama2",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(true)
		})

		it("should return error for missing ollamaBaseUrl", () => {
			const provider: ProviderConfig = {
				id: "test-ollama",
				provider: "ollama",
				ollamaModelId: "llama2",
			}
			const result = validateProviderConfig(provider, false)
			expect(result.valid).toBe(false)
			expect(result.errors).toContain("ollamaBaseUrl must be a string")
		})
	})
})

describe("validateConfig", () => {
	it("should validate a valid config", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "test-provider",
			providers: [
				{
					id: "test-provider",
					provider: "anthropic",
					apiKey: "sk-ant-valid-key-123",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(true)
	})

	it("should return error for invalid provider config", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "test-provider",
			providers: [
				{
					id: "test-provider",
					provider: "anthropic",
					apiKey: "short", // Too short
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(false)
		expect(result.errors?.[0]).toContain("Provider 'test-provider'")
		expect(result.errors?.[0]).toContain("apiKey must be at least 10 characters long")
	})

	it("should validate multiple providers with empty credentials for non-selected", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "provider1",
			providers: [
				{
					id: "provider1",
					provider: "anthropic",
					apiKey: "sk-ant-valid-key-123",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
				{
					id: "provider2",
					provider: "kilocode",
					kilocodeToken: "", // Empty is OK for non-selected provider
					kilocodeModel: "claude-3-5-sonnet",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(true)
	})

	it("should reject config when selected provider has empty credentials", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "provider1",
			providers: [
				{
					id: "provider1",
					provider: "kilocode",
					kilocodeToken: "", // Empty is NOT OK for selected provider
					kilocodeModel: "claude-3-5-sonnet",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(false)
		expect(result.errors?.[0]).toContain("Provider 'provider1'")
		expect(result.errors?.[0]).toContain("kilocodeToken is required and cannot be empty")
	})

	it("should return errors for multiple invalid providers", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "provider1",
			providers: [
				{
					id: "provider1",
					provider: "anthropic",
					apiKey: "short", // Invalid
					apiModelId: "claude-3-5-sonnet-20241022",
				},
				{
					id: "provider2",
					provider: "kilocode",
					kilocodeToken: "short", // Invalid
					kilocodeModel: "claude-3-5-sonnet",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(false)
		expect(result.errors?.length).toBeGreaterThan(0)
		expect(result.errors?.some((e) => e.includes("provider1"))).toBe(true)
		expect(result.errors?.some((e) => e.includes("provider2"))).toBe(true)
	})

	it("should validate selected provider exists", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "non-existent",
			providers: [
				{
					id: "provider1",
					provider: "anthropic",
					apiKey: "sk-ant-valid-key-123",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(false)
		expect(result.errors?.[0]).toContain("Selected provider 'non-existent' not found")
	})

	it("should validate selected provider configuration", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "provider1",
			providers: [
				{
					id: "provider1",
					provider: "anthropic",
					apiKey: "short", // Invalid
					apiModelId: "claude-3-5-sonnet-20241022",
				},
				{
					id: "provider2",
					provider: "kilocode",
					kilocodeToken: "valid-token-123",
					kilocodeModel: "claude-3-5-sonnet",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(false)
		// Should catch the error during provider validation
		expect(result.errors?.some((e) => e.includes("provider1"))).toBe(true)
	})

	it("should return error when no provider is selected", async () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "",
			providers: [
				{
					id: "provider1",
					provider: "anthropic",
					apiKey: "sk-ant-valid-key-123",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = await validateConfig(config)
		expect(result.valid).toBe(false)
		expect(result.errors).toContain("No provider selected in configuration")
	})
})

describe("validateSelectedProvider", () => {
	it("should validate when selected provider exists and is valid", () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "test-provider",
			providers: [
				{
					id: "test-provider",
					provider: "anthropic",
					apiKey: "sk-ant-valid-key-123",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = validateSelectedProvider(config)
		expect(result.valid).toBe(true)
	})

	it("should return error when no provider is selected", () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "",
			providers: [],
		}
		const result = validateSelectedProvider(config)
		expect(result.valid).toBe(false)
		expect(result.errors).toContain("No provider selected in configuration")
	})

	it("should return error when selected provider is not found", () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "non-existent",
			providers: [
				{
					id: "test-provider",
					provider: "anthropic",
					apiKey: "sk-ant-valid-key-123",
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = validateSelectedProvider(config)
		expect(result.valid).toBe(false)
		expect(result.errors?.[0]).toContain("Selected provider 'non-existent' not found")
	})

	it("should return error when selected provider config is invalid", () => {
		const config: CLIConfig = {
			version: "1.0.0",
			mode: "code",
			telemetry: true,
			provider: "test-provider",
			providers: [
				{
					id: "test-provider",
					provider: "anthropic",
					apiKey: "short", // Invalid
					apiModelId: "claude-3-5-sonnet-20241022",
				},
			],
		}
		const result = validateSelectedProvider(config)
		expect(result.valid).toBe(false)
		expect(result.errors?.[0]).toContain("apiKey must be at least 10 characters long")
	})
})
