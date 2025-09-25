import type { ProviderName, ProviderSettings } from "../../types/messages.js"

/**
 * Provider setting configuration interface
 */
export interface ProviderSettingConfig {
	field: string
	label: string
	value: string
	actualValue: string
	type: "text" | "password" | "boolean"
}

/**
 * Get provider-specific settings configuration
 * @param provider - Provider name
 * @param config - Provider configuration object
 * @returns Array of setting configurations
 */
export const getProviderSettings = (provider: ProviderName, config: ProviderSettings): ProviderSettingConfig[] => {
	switch (provider) {
		case "kilocode":
			return [
				{
					field: "kilocodeToken",
					label: "Kilo Code Token",
					value: config.kilocodeToken ? "••••••••" : "Not set",
					actualValue: config.kilocodeToken || "",
					type: "password",
				},
				{
					field: "kilocodeOrganizationId",
					label: "Organization ID",
					value: config.kilocodeOrganizationId || "personal",
					actualValue: config.kilocodeOrganizationId || "",
					type: "text",
				},
				{
					field: "kilocodeModel",
					label: "Model",
					value: config.kilocodeModel || "anthropic/claude-sonnet-4",
					actualValue: config.kilocodeModel || "",
					type: "text",
				},
			]

		case "anthropic":
			return [
				{
					field: "apiKey",
					label: "API Key",
					value: config.apiKey ? "••••••••" : "Not set",
					actualValue: config.apiKey || "",
					type: "password",
				},
				{
					field: "apiModelId",
					label: "Model",
					value: config.apiModelId || "claude-3-5-sonnet-20241022",
					actualValue: config.apiModelId || "",
					type: "text",
				},
				{
					field: "anthropicBaseUrl",
					label: "Base URL",
					value: config.anthropicBaseUrl || "Default",
					actualValue: config.anthropicBaseUrl || "",
					type: "text",
				},
			]

		case "openrouter":
			return [
				{
					field: "openRouterApiKey",
					label: "API Key",
					value: config.openRouterApiKey ? "••••••••" : "Not set",
					actualValue: config.openRouterApiKey || "",
					type: "password",
				},
				{
					field: "openRouterModelId",
					label: "Model",
					value: config.openRouterModelId || "anthropic/claude-3-5-sonnet",
					actualValue: config.openRouterModelId || "",
					type: "text",
				},
				{
					field: "openRouterBaseUrl",
					label: "Base URL",
					value: config.openRouterBaseUrl || "Default",
					actualValue: config.openRouterBaseUrl || "",
					type: "text",
				},
			]

		case "openai-native":
			return [
				{
					field: "openAiNativeApiKey",
					label: "API Key",
					value: config.openAiNativeApiKey ? "••••••••" : "Not set",
					actualValue: config.openAiNativeApiKey || "",
					type: "password",
				},
				{
					field: "apiModelId",
					label: "Model",
					value: config.apiModelId || "gpt-4o",
					actualValue: config.apiModelId || "",
					type: "text",
				},
				{
					field: "openAiNativeBaseUrl",
					label: "Base URL",
					value: config.openAiNativeBaseUrl || "Default",
					actualValue: config.openAiNativeBaseUrl || "",
					type: "text",
				},
			]

		default:
			return []
	}
}

/**
 * Provider-specific default models
 */
export const PROVIDER_DEFAULT_MODELS: Record<ProviderName, string> = {
	kilocode: "anthropic/claude-sonnet-4",
	anthropic: "claude-3-5-sonnet-20241022",
	"openai-native": "gpt-4o",
	openrouter: "anthropic/claude-3-5-sonnet",
	bedrock: "anthropic.claude-3-5-sonnet-20241022-v2:0",
	gemini: "gemini-1.5-pro-latest",
	vertex: "claude-3-5-sonnet@20241022",
	"claude-code": "claude-3-5-sonnet-20241022",
	mistral: "mistral-large-latest",
	groq: "llama-3.1-70b-versatile",
	deepseek: "deepseek-chat",
	xai: "grok-beta",
	cerebras: "llama3.1-8b",
	ollama: "llama3.2",
	lmstudio: "local-model",
	"vscode-lm": "copilot-gpt-4o",
	openai: "gpt-4o",
	glama: "llama-3.1-70b-versatile",
	huggingface: "meta-llama/Llama-2-70b-chat-hf",
	litellm: "gpt-4o",
	moonshot: "moonshot-v1-8k",
	doubao: "ep-20241022-******",
	chutes: "gpt-4o",
	sambanova: "Meta-Llama-3.1-70B-Instruct",
	fireworks: "accounts/fireworks/models/llama-v3p1-70b-instruct",
	featherless: "meta-llama/Llama-3.1-70B-Instruct",
	deepinfra: "meta-llama/Meta-Llama-3.1-70B-Instruct",
	"io-intelligence": "gpt-4o",
	"qwen-code": "qwen-coder-plus-latest",
	"gemini-cli": "gemini-1.5-pro-latest",
	zai: "gpt-4o",
	unbound: "gpt-4o",
	requesty: "gpt-4o",
	roo: "gpt-4o",
	"vercel-ai-gateway": "gpt-4o",
	"virtual-quota-fallback": "gpt-4o",
	"human-relay": "human",
	"fake-ai": "fake-model",
}

/**
 * Get default model for a provider
 * @param provider - Provider name
 * @returns Default model string
 */
export const getProviderDefaultModel = (provider: ProviderName): string => {
	return PROVIDER_DEFAULT_MODELS[provider] || "default-model"
}
