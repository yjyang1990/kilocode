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

		// After schema validation, validate business logic
		if (config && typeof config === "object" && "providers" in config) {
			const cliConfig = config as CLIConfig

			// Validate the selected provider exists and has non-empty credentials
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
 * Validates provider-specific configuration based on provider type.
 * Note: Most validations (required fields, types, minLength) are now handled by schema.json.
 * This function validates business logic: selected providers must have non-empty required credentials.
 *
 * @param provider - The provider configuration to validate
 * @param isSelected - Whether this is the currently selected provider (requires non-empty credentials)
 */
export function validateProviderConfig(provider: ProviderConfig, isSelected: boolean = false): ValidationResult {
	// Schema validation handles:
	// - Provider type existence and validity (enum)
	// - Field types (string, etc.)
	// - Minimum lengths for API keys and tokens (when non-empty)

	// This function validates: selected providers must have non-empty required credentials
	if (!isSelected) {
		return { valid: true }
	}

	const errors: string[] = []

	// Validate selected provider has non-empty required fields
	switch (provider.provider) {
		case "kilocode":
			if (!provider.kilocodeToken || provider.kilocodeToken.length === 0) {
				errors.push("kilocodeToken is required and cannot be empty for selected provider")
			}
			if (!provider.kilocodeModel || provider.kilocodeModel.length === 0) {
				errors.push("kilocodeModel is required and cannot be empty for selected provider")
			}
			break

		case "anthropic":
			if (!provider.apiKey || provider.apiKey.length === 0) {
				errors.push("apiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "openai-native":
			if (!provider.openAiNativeApiKey || provider.openAiNativeApiKey.length === 0) {
				errors.push("openAiNativeApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "openrouter":
			if (!provider.openRouterApiKey || provider.openRouterApiKey.length === 0) {
				errors.push("openRouterApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.openRouterModelId || provider.openRouterModelId.length === 0) {
				errors.push("openRouterModelId is required and cannot be empty for selected provider")
			}
			break

		case "ollama":
			if (!provider.ollamaBaseUrl || provider.ollamaBaseUrl.length === 0) {
				errors.push("ollamaBaseUrl is required and cannot be empty for selected provider")
			}
			if (!provider.ollamaModelId || provider.ollamaModelId.length === 0) {
				errors.push("ollamaModelId is required and cannot be empty for selected provider")
			}
			break

		case "lmstudio":
			if (!provider.lmStudioBaseUrl || provider.lmStudioBaseUrl.length === 0) {
				errors.push("lmStudioBaseUrl is required and cannot be empty for selected provider")
			}
			if (!provider.lmStudioModelId || provider.lmStudioModelId.length === 0) {
				errors.push("lmStudioModelId is required and cannot be empty for selected provider")
			}
			break

		case "bedrock":
			if (!provider.awsAccessKey || provider.awsAccessKey.length === 0) {
				errors.push("awsAccessKey is required and cannot be empty for selected provider")
			}
			if (!provider.awsSecretKey || provider.awsSecretKey.length === 0) {
				errors.push("awsSecretKey is required and cannot be empty for selected provider")
			}
			if (!provider.awsRegion || provider.awsRegion.length === 0) {
				errors.push("awsRegion is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "gemini":
			if (!provider.geminiApiKey || provider.geminiApiKey.length === 0) {
				errors.push("geminiApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "vertex":
			// At least one of vertexJsonCredentials or vertexKeyFile must be provided
			const hasJsonCredentials = provider.vertexJsonCredentials && provider.vertexJsonCredentials.length > 0
			const hasKeyFile = provider.vertexKeyFile && provider.vertexKeyFile.length > 0

			if (!hasJsonCredentials && !hasKeyFile) {
				errors.push(
					"Either vertexJsonCredentials or vertexKeyFile is required and cannot be empty for selected provider",
				)
			}

			if (!provider.vertexProjectId || provider.vertexProjectId.length === 0) {
				errors.push("vertexProjectId is required and cannot be empty for selected provider")
			}
			if (!provider.vertexRegion || provider.vertexRegion.length === 0) {
				errors.push("vertexRegion is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "claude-code":
			if (!provider.claudeCodePath || provider.claudeCodePath.length === 0) {
				errors.push("claudeCodePath is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "mistral":
			if (!provider.mistralApiKey || provider.mistralApiKey.length === 0) {
				errors.push("mistralApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "groq":
			if (!provider.groqApiKey || provider.groqApiKey.length === 0) {
				errors.push("groqApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "deepseek":
			if (!provider.deepSeekApiKey || provider.deepSeekApiKey.length === 0) {
				errors.push("deepSeekApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "xai":
			if (!provider.xaiApiKey || provider.xaiApiKey.length === 0) {
				errors.push("xaiApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "openai":
			if (!provider.openAiApiKey || provider.openAiApiKey.length === 0) {
				errors.push("openAiApiKey is required and cannot be empty for selected provider")
			}
			break

		case "cerebras":
			if (!provider.cerebrasApiKey || provider.cerebrasApiKey.length === 0) {
				errors.push("cerebrasApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "glama":
			if (!provider.glamaApiKey || provider.glamaApiKey.length === 0) {
				errors.push("glamaApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.glamaModelId || provider.glamaModelId.length === 0) {
				errors.push("glamaModelId is required and cannot be empty for selected provider")
			}
			break

		case "huggingface":
			if (!provider.huggingFaceApiKey || provider.huggingFaceApiKey.length === 0) {
				errors.push("huggingFaceApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.huggingFaceModelId || provider.huggingFaceModelId.length === 0) {
				errors.push("huggingFaceModelId is required and cannot be empty for selected provider")
			}
			if (!provider.huggingFaceInferenceProvider || provider.huggingFaceInferenceProvider.length === 0) {
				errors.push("huggingFaceInferenceProvider is required and cannot be empty for selected provider")
			}
			break

		case "litellm":
			if (!provider.litellmBaseUrl || provider.litellmBaseUrl.length === 0) {
				errors.push("litellmBaseUrl is required and cannot be empty for selected provider")
			}
			if (!provider.litellmApiKey || provider.litellmApiKey.length === 0) {
				errors.push("litellmApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.litellmModelId || provider.litellmModelId.length === 0) {
				errors.push("litellmModelId is required and cannot be empty for selected provider")
			}
			break

		case "moonshot":
			if (!provider.moonshotBaseUrl || provider.moonshotBaseUrl.length === 0) {
				errors.push("moonshotBaseUrl is required and cannot be empty for selected provider")
			}
			if (!provider.moonshotApiKey || provider.moonshotApiKey.length === 0) {
				errors.push("moonshotApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "doubao":
			if (!provider.doubaoApiKey || provider.doubaoApiKey.length === 0) {
				errors.push("doubaoApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "chutes":
			if (!provider.chutesApiKey || provider.chutesApiKey.length === 0) {
				errors.push("chutesApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "sambanova":
			if (!provider.sambaNovaApiKey || provider.sambaNovaApiKey.length === 0) {
				errors.push("sambaNovaApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "fireworks":
			if (!provider.fireworksApiKey || provider.fireworksApiKey.length === 0) {
				errors.push("fireworksApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "featherless":
			if (!provider.featherlessApiKey || provider.featherlessApiKey.length === 0) {
				errors.push("featherlessApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "deepinfra":
			if (!provider.deepInfraApiKey || provider.deepInfraApiKey.length === 0) {
				errors.push("deepInfraApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.deepInfraModelId || provider.deepInfraModelId.length === 0) {
				errors.push("deepInfraModelId is required and cannot be empty for selected provider")
			}
			break

		case "io-intelligence":
			if (!provider.ioIntelligenceApiKey || provider.ioIntelligenceApiKey.length === 0) {
				errors.push("ioIntelligenceApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.ioIntelligenceModelId || provider.ioIntelligenceModelId.length === 0) {
				errors.push("ioIntelligenceModelId is required and cannot be empty for selected provider")
			}
			break

		case "qwen-code":
			if (!provider.qwenCodeOauthPath || provider.qwenCodeOauthPath.length === 0) {
				errors.push("qwenCodeOauthPath is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "gemini-cli":
			if (!provider.geminiCliOAuthPath || provider.geminiCliOAuthPath.length === 0) {
				errors.push("geminiCliOAuthPath is required and cannot be empty for selected provider")
			}
			if (!provider.geminiCliProjectId || provider.geminiCliProjectId.length === 0) {
				errors.push("geminiCliProjectId is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "vscode-lm":
			if (!provider.vsCodeLmModelSelector) {
				errors.push("vsCodeLmModelSelector is required for selected provider")
			} else {
				if (!provider.vsCodeLmModelSelector.vendor || provider.vsCodeLmModelSelector.vendor.length === 0) {
					errors.push("vsCodeLmModelSelector.vendor is required and cannot be empty for selected provider")
				}
				if (!provider.vsCodeLmModelSelector.family || provider.vsCodeLmModelSelector.family.length === 0) {
					errors.push("vsCodeLmModelSelector.family is required and cannot be empty for selected provider")
				}
			}
			break

		case "zai":
			if (!provider.zaiApiKey || provider.zaiApiKey.length === 0) {
				errors.push("zaiApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.zaiApiLine || provider.zaiApiLine.length === 0) {
				errors.push("zaiApiLine is required and cannot be empty for selected provider")
			}
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "unbound":
			if (!provider.unboundApiKey || provider.unboundApiKey.length === 0) {
				errors.push("unboundApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.unboundModelId || provider.unboundModelId.length === 0) {
				errors.push("unboundModelId is required and cannot be empty for selected provider")
			}
			break

		case "requesty":
			if (!provider.requestyApiKey || provider.requestyApiKey.length === 0) {
				errors.push("requestyApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.requestyModelId || provider.requestyModelId.length === 0) {
				errors.push("requestyModelId is required and cannot be empty for selected provider")
			}
			break

		case "roo":
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "vercel-ai-gateway":
			if (!provider.vercelAiGatewayApiKey || provider.vercelAiGatewayApiKey.length === 0) {
				errors.push("vercelAiGatewayApiKey is required and cannot be empty for selected provider")
			}
			if (!provider.vercelAiGatewayModelId || provider.vercelAiGatewayModelId.length === 0) {
				errors.push("vercelAiGatewayModelId is required and cannot be empty for selected provider")
			}
			break

		case "virtual-quota-fallback":
			if (!provider.profiles || !Array.isArray(provider.profiles) || provider.profiles.length === 0) {
				errors.push("profiles is required and must be a non-empty array for selected provider")
			}
			break

		case "human-relay":
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		case "fake-ai":
			if (!provider.apiModelId || provider.apiModelId.length === 0) {
				errors.push("apiModelId is required and cannot be empty for selected provider")
			}
			break

		default:
			// For other providers, no additional validation needed
			break
	}

	if (errors.length > 0) {
		return { valid: false, errors }
	}

	return { valid: true }
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
