import type { CLIConfig } from "./types.js"

export const DEFAULT_CONFIG: CLIConfig = {
	version: "1.0.0",
	mode: "code",
	telemetry: true,
	provider: "default",
	providers: [
		{
			id: "default",
			provider: "kilocode",
			kilocodeToken: "",
			kilocodeModel: "anthropic/claude-sonnet-4",
		},
	],
}

export function createDefaultProvider(provider: string): any {
	switch (provider) {
		case "kilocode":
			return {
				id: "kilocode-default",
				provider: "kilocode",
				kilocodeToken: "",
				kilocodeModel: "anthropic/claude-sonnet-4",
			}
		case "anthropic":
			return {
				id: "anthropic-default",
				provider: "anthropic",
				apiKey: "",
				apiModelId: "claude-3-5-sonnet-20241022",
			}
		case "openai-native":
			return {
				id: "openai-default",
				provider: "openai-native",
				openAiNativeApiKey: "",
				apiModelId: "gpt-4o",
			}
		case "openrouter":
			return {
				id: "openrouter-default",
				provider: "openrouter",
				openRouterApiKey: "",
				openRouterModelId: "anthropic/claude-3-5-sonnet",
			}
		case "ollama":
			return {
				id: "ollama-default",
				provider: "ollama",
				ollamaBaseUrl: "http://localhost:11434",
				ollamaModelId: "llama3.2",
			}
		case "openai":
			return {
				id: "openai-default",
				provider: "openai",
				openAiApiKey: "",
				openAiBaseUrl: "",
				apiModelId: "gpt-4o",
			}
		default:
			return {
				id: `${provider}-default`,
				provider,
			}
	}
}
