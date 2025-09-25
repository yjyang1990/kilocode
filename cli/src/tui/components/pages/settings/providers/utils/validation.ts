import type { ProviderSettings, ProviderName, ProviderSettingsEntry } from "../../../../../../types/messages.js"

export interface ValidationResult {
	isValid: boolean
	errors: Record<string, string>
}

export const validateProviderSettings = (provider: ProviderName, settings: ProviderSettings): ValidationResult => {
	const errors: Record<string, string> = {}

	switch (provider) {
		case "kilocode":
			if (!settings.kilocodeToken) {
				errors.kilocodeToken = "Kilo Code token is required"
			}
			break

		case "anthropic":
			if (!settings.apiKey) {
				errors.apiKey = "Anthropic API key is required"
			}
			if (settings.anthropicBaseUrl && !isValidUrl(settings.anthropicBaseUrl)) {
				errors.anthropicBaseUrl = "Invalid base URL format"
			}
			break

		case "openrouter":
			if (!settings.openRouterApiKey) {
				errors.openRouterApiKey = "OpenRouter API key is required"
			}
			if (settings.openRouterBaseUrl && !isValidUrl(settings.openRouterBaseUrl)) {
				errors.openRouterBaseUrl = "Invalid base URL format"
			}
			break

		case "openai-native":
			if (!settings.openAiNativeApiKey) {
				errors.openAiNativeApiKey = "OpenAI API key is required"
			}
			if (settings.openAiNativeBaseUrl && !isValidUrl(settings.openAiNativeBaseUrl)) {
				errors.openAiNativeBaseUrl = "Invalid base URL format"
			}
			if (
				settings.openAiNativeServiceTier &&
				!["default", "flex", "priority"].includes(settings.openAiNativeServiceTier)
			) {
				errors.openAiNativeServiceTier = "Invalid service tier. Must be: default, flex, or priority"
			}
			break

		case "bedrock":
			if (!settings.awsUseProfile && !settings.awsUseApiKey) {
				if (!settings.awsAccessKey) {
					errors.awsAccessKey = "AWS Access Key is required"
				}
				if (!settings.awsSecretKey) {
					errors.awsSecretKey = "AWS Secret Key is required"
				}
			}
			if (settings.awsUseProfile && !settings.awsProfile) {
				errors.awsProfile = "AWS Profile name is required"
			}
			if (settings.awsUseApiKey && !settings.awsApiKey) {
				errors.awsApiKey = "AWS API Key is required"
			}
			if (!settings.awsRegion) {
				errors.awsRegion = "AWS Region is required"
			}
			break

		case "gemini":
			if (!settings.geminiApiKey) {
				errors.geminiApiKey = "Gemini API key is required"
			}
			if (settings.googleGeminiBaseUrl && !isValidUrl(settings.googleGeminiBaseUrl)) {
				errors.googleGeminiBaseUrl = "Invalid base URL format"
			}
			break

		default:
			// Basic validation for other providers
			break
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

export const validateProfileName = (
	name: string,
	existingProfiles: ProviderSettingsEntry[],
	currentProfileName?: string,
): string | null => {
	const trimmed = name.trim()
	if (!trimmed) return "Profile name cannot be empty"

	// Allow keeping the same name when renaming
	if (currentProfileName && trimmed.toLowerCase() === currentProfileName.toLowerCase()) {
		return null
	}

	const nameExists = existingProfiles.some((profile) => profile.name.toLowerCase() === trimmed.toLowerCase())

	if (nameExists) return "Profile name already exists"

	return null
}

const isValidUrl = (url: string): boolean => {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

export const getFieldValidationError = (field: string, value: string, provider: ProviderName): string | null => {
	// Real-time field validation
	switch (field) {
		case "anthropicBaseUrl":
		case "openRouterBaseUrl":
		case "openAiNativeBaseUrl":
		case "googleGeminiBaseUrl":
			if (value && !isValidUrl(value)) {
				return "Invalid URL format"
			}
			break

		case "openAiNativeServiceTier":
			if (value && !["default", "flex", "priority"].includes(value)) {
				return "Must be: default, flex, or priority"
			}
			break

		case "anthropicUseAuthToken":
		case "anthropicBeta1MContext":
		case "openRouterUseMiddleOutTransform":
		case "awsUseCrossRegionInference":
		case "awsUsePromptCache":
		case "enableUrlContext":
		case "enableGrounding":
			if (value && !["true", "false"].includes(value.toLowerCase())) {
				return "Must be: true or false"
			}
			break

		default:
			break
	}

	return null
}
