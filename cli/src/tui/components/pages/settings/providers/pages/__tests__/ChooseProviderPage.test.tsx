import { describe, it, expect } from "vitest"

// Test the scrolling logic for the ChooseProviderPage
describe("ChooseProviderPage Scrolling Logic", () => {
	const PROVIDERS = [
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
	]

	const VISIBLE_ITEMS = 15

	const calculateVisibleProviders = (selectedIndex: number, providers: typeof PROVIDERS) => {
		const startIndex = Math.max(
			0,
			Math.min(selectedIndex - Math.floor(VISIBLE_ITEMS / 2), providers.length - VISIBLE_ITEMS),
		)
		const endIndex = Math.min(startIndex + VISIBLE_ITEMS, providers.length)
		return {
			providers: providers.slice(startIndex, endIndex),
			startIndex,
			endIndex,
		}
	}

	it("should calculate correct visible range for first item", () => {
		const result = calculateVisibleProviders(0, PROVIDERS)

		expect(result.startIndex).toBe(0)
		expect(result.endIndex).toBe(15)
		expect(result.providers).toHaveLength(15)
		expect(result.providers[0]?.value).toBe("kilocode")
	})

	it("should calculate correct visible range for middle item", () => {
		const result = calculateVisibleProviders(10, PROVIDERS)

		expect(result.startIndex).toBe(3) // 10 - 7 (floor of 15/2)
		expect(result.endIndex).toBe(18)
		expect(result.providers).toHaveLength(15)
	})

	it("should calculate correct visible range for last item", () => {
		const result = calculateVisibleProviders(19, PROVIDERS)

		expect(result.startIndex).toBe(5) // 20 - 15
		expect(result.endIndex).toBe(20)
		expect(result.providers).toHaveLength(15)
		expect(result.providers[14]?.value).toBe("litellm")
	})

	it("should handle edge case when there are fewer items than visible", () => {
		const smallProviders = PROVIDERS.slice(0, 10)
		const result = calculateVisibleProviders(5, smallProviders)

		expect(result.startIndex).toBe(0)
		expect(result.endIndex).toBe(10)
		expect(result.providers).toHaveLength(10)
	})

	it("should find correct provider index", () => {
		const currentProvider = "anthropic"
		const index = PROVIDERS.findIndex((p) => p.value === currentProvider)

		expect(index).toBe(1)
		expect(PROVIDERS[index]?.label).toBe("Anthropic")
	})

	it("should handle provider not found", () => {
		const currentProvider = "nonexistent"
		const index = PROVIDERS.findIndex((p) => p.value === currentProvider)

		expect(index).toBe(-1)
	})
})
