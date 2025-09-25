import type { ProviderName } from "../../types/messages.js"

/**
 * RouterName type - mirrors the one from src/shared/api.ts
 */
export type RouterName =
	| "openrouter"
	| "requesty"
	| "glama"
	| "unbound"
	| "litellm"
	| "kilocode-openrouter"
	| "ollama"
	| "lmstudio"
	| "io-intelligence"
	| "deepinfra"
	| "vercel-ai-gateway"

/**
 * ModelInfo interface - mirrors the one from packages/types/src/model.ts
 */
export interface ModelInfo {
	maxTokens?: number | null
	maxThinkingTokens?: number | null
	contextWindow: number
	supportsImages?: boolean
	supportsComputerUse?: boolean
	supportsPromptCache: boolean
	supportsVerbosity?: boolean
	supportsReasoningBudget?: boolean
	supportsTemperature?: boolean
	requiredReasoningBudget?: boolean
	supportsReasoningEffort?: boolean
	inputPrice?: number
	outputPrice?: number
	cacheWritesPrice?: number
	cacheReadsPrice?: number
	description?: string
	displayName?: string | null
	preferredIndex?: number | null
}

export type ModelRecord = Record<string, ModelInfo>
export type RouterModels = Record<RouterName, ModelRecord>

/**
 * Mapping from ProviderName to RouterName for model fetching
 */
export const PROVIDER_TO_ROUTER_NAME: Record<ProviderName, RouterName | null> = {
	kilocode: "kilocode-openrouter",
	openrouter: "openrouter",
	ollama: "ollama",
	lmstudio: "lmstudio",
	litellm: "litellm",
	glama: "glama",
	unbound: "unbound",
	requesty: "requesty",
	deepinfra: "deepinfra",
	"io-intelligence": "io-intelligence",
	"vercel-ai-gateway": "vercel-ai-gateway",
	// Providers without dynamic model support
	anthropic: null,
	bedrock: null,
	vertex: null,
	openai: null,
	"vscode-lm": null,
	gemini: null,
	"openai-native": null,
	mistral: null,
	moonshot: null,
	deepseek: null,
	doubao: null,
	"qwen-code": null,
	"human-relay": null,
	"fake-ai": null,
	xai: null,
	groq: null,
	chutes: null,
	cerebras: null,
	sambanova: null,
	zai: null,
	fireworks: null,
	featherless: null,
	roo: null,
	"claude-code": null,
	"gemini-cli": null,
	"virtual-quota-fallback": null,
	huggingface: null,
}

/**
 * Mapping from ProviderName to the field name that stores the model ID
 */
export const PROVIDER_MODEL_FIELD: Record<ProviderName, string | null> = {
	kilocode: "kilocodeModel",
	openrouter: "openRouterModelId",
	ollama: "ollamaModelId",
	lmstudio: "lmStudioModelId",
	litellm: "litellmModelId",
	glama: "glamaModelId",
	unbound: "unboundModelId",
	requesty: "requestyModelId",
	deepinfra: "deepInfraModelId",
	"io-intelligence": "ioIntelligenceModelId",
	"vercel-ai-gateway": "vercelAiGatewayModelId",
	// Providers without dynamic model support
	anthropic: null,
	bedrock: null,
	vertex: null,
	openai: null,
	"vscode-lm": null,
	gemini: null,
	"openai-native": null,
	mistral: null,
	moonshot: null,
	deepseek: null,
	doubao: null,
	"qwen-code": null,
	"human-relay": null,
	"fake-ai": null,
	xai: null,
	groq: null,
	chutes: null,
	cerebras: null,
	sambanova: null,
	zai: null,
	fireworks: null,
	featherless: null,
	roo: null,
	"claude-code": null,
	"gemini-cli": null,
	"virtual-quota-fallback": null,
	huggingface: null,
}

/**
 * Check if a provider supports dynamic model lists
 */
export const providerSupportsModelList = (provider: ProviderName): boolean => {
	return PROVIDER_TO_ROUTER_NAME[provider] !== null
}

/**
 * Check if a field is a model selection field
 */
export const isModelField = (field: string): boolean => {
	return Object.values(PROVIDER_MODEL_FIELD).includes(field)
}

/**
 * Get the RouterName for a provider
 */
export const getRouterNameForProvider = (provider: ProviderName): RouterName | null => {
	return PROVIDER_TO_ROUTER_NAME[provider]
}

/**
 * Get the model field name for a provider
 */
export const getModelFieldForProvider = (provider: ProviderName): string | null => {
	return PROVIDER_MODEL_FIELD[provider]
}
