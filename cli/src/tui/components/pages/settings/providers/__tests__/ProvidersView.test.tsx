import { describe, it, expect, vi } from "vitest"
import { validateProviderSettings, validateProfileName, getFieldValidationError } from "../utils/validation.js"
import type { ProviderSettings, ProviderSettingsEntry } from "../../../../../../types/messages.js"

describe("Provider Settings Validation", () => {
	it("validates Kilocode provider settings", () => {
		const settings: ProviderSettings = {
			apiProvider: "kilocode",
			kilocodeToken: "",
		}

		const result = validateProviderSettings("kilocode", settings)
		expect(result.isValid).toBe(false)
		expect(result.errors.kilocodeToken).toBe("Kilo Code token is required")
	})

	it("validates Anthropic provider settings", () => {
		const settings: ProviderSettings = {
			apiProvider: "anthropic",
			apiKey: "",
		}

		const result = validateProviderSettings("anthropic", settings)
		expect(result.isValid).toBe(false)
		expect(result.errors.apiKey).toBe("Anthropic API key is required")
	})

	it("validates OpenRouter provider settings", () => {
		const settings: ProviderSettings = {
			apiProvider: "openrouter",
			openRouterApiKey: "",
		}

		const result = validateProviderSettings("openrouter", settings)
		expect(result.isValid).toBe(false)
		expect(result.errors.openRouterApiKey).toBe("OpenRouter API key is required")
	})

	it("validates profile names correctly", () => {
		const existingProfiles: ProviderSettingsEntry[] = [
			{ id: "1", name: "default", apiProvider: "kilocode" },
			{ id: "2", name: "anthropic", apiProvider: "anthropic" },
		]

		// Empty name
		expect(validateProfileName("", existingProfiles)).toBe("Profile name cannot be empty")

		// Existing name
		expect(validateProfileName("default", existingProfiles)).toBe("Profile name already exists")

		// Valid new name
		expect(validateProfileName("new-profile", existingProfiles)).toBe(null)

		// Same name when renaming (should be allowed)
		expect(validateProfileName("default", existingProfiles, "default")).toBe(null)
	})

	it("validates field values correctly", () => {
		// URL validation
		expect(getFieldValidationError("anthropicBaseUrl", "invalid-url", "anthropic")).toBe("Invalid URL format")
		expect(getFieldValidationError("anthropicBaseUrl", "https://api.anthropic.com", "anthropic")).toBe(null)

		// Boolean validation
		expect(getFieldValidationError("anthropicUseAuthToken", "maybe", "anthropic")).toBe("Must be: true or false")
		expect(getFieldValidationError("anthropicUseAuthToken", "true", "anthropic")).toBe(null)

		// Service tier validation
		expect(getFieldValidationError("openAiNativeServiceTier", "invalid", "openai-native")).toBe(
			"Must be: default, flex, or priority",
		)
		expect(getFieldValidationError("openAiNativeServiceTier", "flex", "openai-native")).toBe(null)
	})
})
