import { AUTOCOMPLETE_PROVIDER_MODELS, modelIdKeysByProvider } from "@roo-code/types"
import { ApiHandler, buildApiHandler } from "../../api"
import { ProviderSettingsManager } from "../../core/config/ProviderSettingsManager"
import { OpenRouterHandler } from "../../api/providers"
import { ApiStreamChunk } from "../../api/transform/stream"

export class GhostModel {
	private apiHandler: ApiHandler | null = null
	private provider: string | null = null
	public loaded = false

	constructor(apiHandler: ApiHandler | null = null) {
		if (apiHandler) {
			this.apiHandler = apiHandler
			this.loaded = true
		}
	}

	public async reload(providerSettingsManager: ProviderSettingsManager) {
		const profiles = await providerSettingsManager.listConfig()
		const supportedProviders = Object.keys(
			AUTOCOMPLETE_PROVIDER_MODELS,
		) as (keyof typeof AUTOCOMPLETE_PROVIDER_MODELS)[]

		for (const provider of supportedProviders) {
			const selectedProfile = profiles.find(
				(x): x is typeof x & { apiProvider: string } => !!x.apiProvider && x.apiProvider === provider,
			)
			if (selectedProfile) {
				const profile = await providerSettingsManager.getProfile({
					id: selectedProfile.id,
				})
				const modelDefinition = {
					[modelIdKeysByProvider[provider]]: AUTOCOMPLETE_PROVIDER_MODELS[provider],
				}
				this.apiHandler = buildApiHandler({
					...profile,
					...modelDefinition,
				})
				this.provider = provider

				break
			}
		}

		if (this.apiHandler instanceof OpenRouterHandler) {
			await this.apiHandler.fetchModel()
		}

		this.loaded = true
	}

	/**
	 * Generate response with streaming callback support
	 */
	public async generateResponse(
		systemPrompt: string,
		userPrompt: string,
		onChunk: (chunk: ApiStreamChunk) => void,
	): Promise<{
		cost: number
		inputTokens: number
		outputTokens: number
		cacheWriteTokens: number
		cacheReadTokens: number
	}> {
		if (!this.apiHandler) {
			console.error("API handler is not initialized")
			throw new Error("API handler is not initialized. Please check your configuration.")
		}

		console.log("USED MODEL", this.apiHandler.getModel())

		const stream = this.apiHandler.createMessage(systemPrompt, [
			{ role: "user", content: [{ type: "text", text: userPrompt }] },
		])

		let cost = 0
		let inputTokens = 0
		let outputTokens = 0
		let cacheReadTokens = 0
		let cacheWriteTokens = 0

		try {
			for await (const chunk of stream) {
				// Call the callback with each chunk
				onChunk(chunk)

				// Track usage information
				if (chunk.type === "usage") {
					cost = chunk.totalCost ?? 0
					cacheReadTokens = chunk.cacheReadTokens ?? 0
					cacheWriteTokens = chunk.cacheWriteTokens ?? 0
					inputTokens = chunk.inputTokens ?? 0
					outputTokens = chunk.outputTokens ?? 0
				}
			}
		} catch (error) {
			console.error("Error streaming completion:", error)
			throw error
		}

		return {
			cost,
			inputTokens,
			outputTokens,
			cacheWriteTokens,
			cacheReadTokens,
		}
	}

	public getModelName(): string | null {
		if (!this.apiHandler) {
			return null
		}
		return this.apiHandler.getModel().id ?? "unknown"
	}

	public getProviderDisplayName(): string | null {
		if (!this.provider) {
			return null
		}
		return this.formatProviderName(this.provider)
	}

	private formatProviderName(provider: string): string {
		const providerDisplayNames: Record<string, string> = {
			anthropic: "Anthropic",
			openai: "OpenAI",
			"openai-native": "OpenAI",
			openrouter: "OpenRouter",
			bedrock: "AWS Bedrock",
			vertex: "Google Vertex AI",
			ollama: "Ollama",
			lmstudio: "LM Studio",
			gemini: "Google Gemini",
			"gemini-cli": "Google Gemini CLI",
			deepseek: "DeepSeek",
			doubao: "Doubao",
			"qwen-code": "Qwen Code",
			moonshot: "Moonshot",
			"vscode-lm": "VS Code LM",
			mistral: "Mistral AI",
			unbound: "Unbound",
			requesty: "Requesty",
			"human-relay": "Human Relay",
			"fake-ai": "Fake AI",
			xai: "xAI",
			groq: "Groq",
			deepinfra: "DeepInfra",
			huggingface: "Hugging Face",
			chutes: "Chutes",
			litellm: "LiteLLM",
			cerebras: "Cerebras",
			sambanova: "SambaNova",
			zai: "ZAI",
			fireworks: "Fireworks AI",
			synthetic: "Synthetic",
			"io-intelligence": "IO Intelligence",
			roo: "Roo",
			featherless: "Featherless",
			"vercel-ai-gateway": "Vercel AI Gateway",
			ovhcloud: "OVHcloud",
			kilocode: "Kilo Code",
			"kilocode-openrouter": "Kilo Code (OpenRouter)",
			"virtual-quota-fallback": "Virtual Quota Fallback",
			glama: "Glama",
			"claude-code": "Claude Code",
		}

		return providerDisplayNames[provider] || provider
	}

	public hasValidCredentials(): boolean {
		return this.apiHandler !== null && this.loaded
	}
}
