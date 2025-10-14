import Ajv from "ajv"
import * as fs from "fs/promises"
import * as path from "path"
import type { CLIConfig, ProviderConfig } from "./types.js"

// __dirname is provided by the banner in the bundled output
declare const __dirname: string

let ajv: Ajv | null = null
let validateFunction: ReturnType<Ajv["compile"]> | null = null

async function getValidator() {
	if (!validateFunction) {
		ajv = new Ajv({ allErrors: true, strict: false })
		const schemaPath = path.join(__dirname, "config", "schema.json")
		const schemaContent = await fs.readFile(schemaPath, "utf-8")
		const schema = JSON.parse(schemaContent)
		validateFunction = ajv.compile(schema)
	}
	return validateFunction
}

export interface ValidationResult {
	valid: boolean
	errors?: string[]
}

export async function validateConfig(config: unknown): Promise<ValidationResult> {
	try {
		const validate = await getValidator()
		const valid = validate(config)

		if (!valid) {
			const errors =
				validate.errors?.map((err) => {
					const path = err.instancePath || "root"
					return `${path}: ${err.message}`
				}) || []
			return { valid: false, errors }
		}

		// After schema validation, validate provider configurations
		if (config && typeof config === "object" && "providers" in config) {
			const cliConfig = config as CLIConfig
			const providerErrors: string[] = []

			// Validate each provider configuration (allow empty for non-selected providers)
			for (const provider of cliConfig.providers) {
				const isSelected = provider.id === cliConfig.provider
				const providerResult = validateProviderConfig(provider, isSelected)
				if (!providerResult.valid && providerResult.errors) {
					providerErrors.push(...providerResult.errors.map((err) => `Provider '${provider.id}': ${err}`))
				}
			}

			if (providerErrors.length > 0) {
				return { valid: false, errors: providerErrors }
			}

			// Validate the selected provider exists
			const selectedProviderResult = validateSelectedProvider(cliConfig)
			if (!selectedProviderResult.valid) {
				return selectedProviderResult
			}
		}

		return { valid: true }
	} catch (error) {
		return {
			valid: false,
			errors: [`Validation error: ${error instanceof Error ? error.message : String(error)}`],
		}
	}
}

/**
 * Minimum length for API keys and tokens
 */
const MIN_API_KEY_LENGTH = 10

/**
 * Validates that a string field is non-empty and meets minimum length requirements
 * @param value - The value to validate
 * @param fieldName - The name of the field for error messages
 * @param minLength - Minimum length requirement
 * @param allowEmpty - Whether to allow empty strings (for unconfigured providers)
 */
function validateStringField(
	value: unknown,
	fieldName: string,
	minLength: number = 1,
	allowEmpty: boolean = true,
): string | null {
	if (typeof value !== "string") {
		return `${fieldName} must be a string`
	}
	// Check if empty strings are allowed
	if (value.length === 0) {
		return allowEmpty ? null : `${fieldName} is required and cannot be empty`
	}
	// If not empty, check minimum length
	if (value.length < minLength) {
		return `${fieldName} must be at least ${minLength} characters long`
	}
	return null
}

/**
 * Validates provider-specific configuration based on provider type
 * @param provider - The provider configuration to validate
 * @param isSelected - Whether this is the currently selected provider (requires non-empty credentials)
 */
export function validateProviderConfig(provider: ProviderConfig, isSelected: boolean = false): ValidationResult {
	const errors: string[] = []

	// Check provider type exists
	if (!provider.provider) {
		return {
			valid: false,
			errors: ["Provider type is required"],
		}
	}

	// Validate based on provider type
	// For selected providers, empty credentials are not allowed
	const allowEmpty = !isSelected

	switch (provider.provider) {
		case "kilocode": {
			const tokenError = validateStringField(
				provider.kilocodeToken,
				"kilocodeToken",
				MIN_API_KEY_LENGTH,
				allowEmpty,
			)
			if (tokenError) errors.push(tokenError)

			const modelError = validateStringField(provider.kilocodeModel, "kilocodeModel", 1, allowEmpty)
			if (modelError) errors.push(modelError)
			break
		}

		case "anthropic": {
			const keyError = validateStringField(provider.apiKey, "apiKey", MIN_API_KEY_LENGTH, allowEmpty)
			if (keyError) errors.push(keyError)

			const modelError = validateStringField(provider.apiModelId, "apiModelId", 1, allowEmpty)
			if (modelError) errors.push(modelError)
			break
		}

		case "openai-native": {
			const keyError = validateStringField(
				provider.openAiNativeApiKey,
				"openAiNativeApiKey",
				MIN_API_KEY_LENGTH,
				allowEmpty,
			)
			if (keyError) errors.push(keyError)

			const modelError = validateStringField(provider.apiModelId, "apiModelId", 1, allowEmpty)
			if (modelError) errors.push(modelError)
			break
		}

		case "openrouter": {
			const keyError = validateStringField(
				provider.openRouterApiKey,
				"openRouterApiKey",
				MIN_API_KEY_LENGTH,
				allowEmpty,
			)
			if (keyError) errors.push(keyError)

			const modelError = validateStringField(provider.openRouterModelId, "openRouterModelId", 1, allowEmpty)
			if (modelError) errors.push(modelError)
			break
		}

		case "ollama": {
			const urlError = validateStringField(provider.ollamaBaseUrl, "ollamaBaseUrl", 1, allowEmpty)
			if (urlError) errors.push(urlError)

			const modelError = validateStringField(provider.ollamaModelId, "ollamaModelId", 1, allowEmpty)
			if (modelError) errors.push(modelError)
			break
		}

		case "openai": {
			const keyError = validateStringField(provider.openAiApiKey, "openAiApiKey", MIN_API_KEY_LENGTH, allowEmpty)
			if (keyError) errors.push(keyError)
			break
		}

		// Add more provider validations as needed
		default:
			// For other providers, just check if they have basic configuration
			break
	}

	if (errors.length > 0) {
		return {
			valid: false,
			errors,
		}
	}

	return {
		valid: true,
	}
}

/**
 * Validates the selected provider in the config
 */
export function validateSelectedProvider(config: CLIConfig): ValidationResult {
	// Check if provider ID is set
	if (!config.provider) {
		return {
			valid: false,
			errors: ["No provider selected in configuration"],
		}
	}

	// Find the selected provider
	const selectedProvider = config.providers.find((p) => p.id === config.provider)
	if (!selectedProvider) {
		return {
			valid: false,
			errors: [`Selected provider '${config.provider}' not found in providers list`],
		}
	}

	// Validate the provider configuration (must have non-empty credentials)
	return validateProviderConfig(selectedProvider, true)
}
