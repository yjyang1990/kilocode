import type { ProviderName } from "../../types/messages.js"

/**
 * Provider display labels mapping
 * Maps provider internal names to user-friendly display names
 */
export const PROVIDER_LABELS: Record<ProviderName, string> = {
	kilocode: "Kilo Code",
	anthropic: "Anthropic",
	"openai-native": "OpenAI",
	openrouter: "OpenRouter",
	bedrock: "Amazon Bedrock",
	gemini: "Google Gemini",
	vertex: "GCP Vertex AI",
	"claude-code": "Claude Code",
	mistral: "Mistral",
	groq: "Groq",
	deepseek: "DeepSeek",
	xai: "xAI (Grok)",
	cerebras: "Cerebras",
	ollama: "Ollama",
	lmstudio: "LM Studio",
	"vscode-lm": "VS Code LM API",
	openai: "OpenAI Compatible",
	glama: "Glama",
	huggingface: "Hugging Face",
	litellm: "LiteLLM",
	moonshot: "Moonshot",
	doubao: "Doubao",
	chutes: "Chutes AI",
	sambanova: "SambaNova",
	fireworks: "Fireworks",
	featherless: "Featherless",
	deepinfra: "DeepInfra",
	"io-intelligence": "IO Intelligence",
	"qwen-code": "Qwen Code",
	"gemini-cli": "Gemini CLI",
	zai: "Zai",
	unbound: "Unbound",
	requesty: "Requesty",
	roo: "Roo",
	"vercel-ai-gateway": "Vercel AI Gateway",
	"virtual-quota-fallback": "Virtual Quota Fallback",
	"human-relay": "Human Relay",
	"fake-ai": "Fake AI",
}

/**
 * Provider list with value and label pairs
 * Used for selection components and dropdowns
 */
export const PROVIDER_OPTIONS: Array<{ value: ProviderName; label: string }> = [
	{ value: "kilocode", label: "Kilo Code" },
	{ value: "anthropic", label: "Anthropic" },
	{ value: "openai-native", label: "OpenAI" },
	{ value: "openrouter", label: "OpenRouter" },
	{ value: "bedrock", label: "Amazon Bedrock" },
	{ value: "gemini", label: "Google Gemini" },
	{ value: "vertex", label: "GCP Vertex AI" },
	{ value: "claude-code", label: "Claude Code" },
	{ value: "mistral", label: "Mistral" },
	{ value: "groq", label: "Groq" },
	{ value: "deepseek", label: "DeepSeek" },
	{ value: "xai", label: "xAI (Grok)" },
	{ value: "cerebras", label: "Cerebras" },
	{ value: "ollama", label: "Ollama" },
	{ value: "lmstudio", label: "LM Studio" },
	{ value: "vscode-lm", label: "VS Code LM API" },
	{ value: "openai", label: "OpenAI Compatible" },
	{ value: "glama", label: "Glama" },
	{ value: "huggingface", label: "Hugging Face" },
	{ value: "litellm", label: "LiteLLM" },
	{ value: "moonshot", label: "Moonshot" },
	{ value: "doubao", label: "Doubao" },
	{ value: "chutes", label: "Chutes AI" },
	{ value: "sambanova", label: "SambaNova" },
	{ value: "fireworks", label: "Fireworks" },
	{ value: "featherless", label: "Featherless" },
	{ value: "deepinfra", label: "DeepInfra" },
	{ value: "io-intelligence", label: "IO Intelligence" },
	{ value: "qwen-code", label: "Qwen Code" },
	{ value: "gemini-cli", label: "Gemini CLI" },
	{ value: "zai", label: "Zai" },
	{ value: "unbound", label: "Unbound" },
	{ value: "requesty", label: "Requesty" },
	{ value: "roo", label: "Roo" },
	{ value: "vercel-ai-gateway", label: "Vercel AI Gateway" },
	{ value: "virtual-quota-fallback", label: "Virtual Quota Fallback" },
	{ value: "human-relay", label: "Human Relay" },
	{ value: "fake-ai", label: "Fake AI" },
]

/**
 * Get provider display label by provider name
 * @param provider - Provider name or undefined
 * @returns User-friendly display name
 */
export const getProviderLabel = (provider: ProviderName | undefined): string => {
	return provider ? PROVIDER_LABELS[provider] || provider : "No provider selected"
}
