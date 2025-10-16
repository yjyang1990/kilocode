import { GhostSuggestionContext } from "./types"
import { PromptStrategy } from "./types/PromptStrategy"

// Import all strategies
import { AutoTriggerStrategy } from "./strategies/AutoTriggerStrategy"

/**
 * Manages prompt strategies and selects the appropriate one based on context
 */
export class PromptStrategyManager {
	private autoTriggerStrategy: AutoTriggerStrategy
	private debug: boolean

	constructor(options?: { debug?: boolean }) {
		this.debug = options?.debug ?? false

		this.autoTriggerStrategy = new AutoTriggerStrategy()
	}

	/**
	 * Selects the most appropriate strategy for the given context
	 * @param context The suggestion context
	 * @returns The selected strategy
	 */
	selectStrategy(context: GhostSuggestionContext): PromptStrategy {
		return this.autoTriggerStrategy
	}

	getAvailableStrategies(): string[] {
		return [this.autoTriggerStrategy.name]
	}

	/**
	 * Builds complete prompts using the selected strategy
	 * @param context The suggestion context
	 * @returns Object containing system and user prompts
	 */
	buildPrompt(context: GhostSuggestionContext): {
		systemPrompt: string
		userPrompt: string
		strategy: PromptStrategy
	} {
		const strategy = this.autoTriggerStrategy

		const { systemPrompt, userPrompt } = this.autoTriggerStrategy.getPrompts(context)

		if (this.debug) {
			console.log("[PromptStrategyManager] Prompt built:", {
				strategy: strategy.name,
				systemPromptLength: systemPrompt.length,
				userPromptLength: userPrompt.length,
				totalTokensEstimate: Math.ceil((systemPrompt.length + userPrompt.length) / 4),
			})
		}

		return {
			systemPrompt,
			userPrompt,
			strategy,
		}
	}
}
