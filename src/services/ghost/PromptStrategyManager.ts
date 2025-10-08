import { GhostSuggestionContext } from "./types"
import { PromptStrategy } from "./types/PromptStrategy"

// Import all strategies
import { UserRequestStrategy } from "./strategies/UserRequestStrategy"
import { ErrorFixStrategy } from "./strategies/ErrorFixStrategy"
import { SelectionRefactorStrategy } from "./strategies/SelectionRefactorStrategy"
import { CommentDrivenStrategy } from "./strategies/CommentDrivenStrategy"
import { NewLineCompletionStrategy } from "./strategies/NewLineCompletionStrategy"
import { InlineCompletionStrategy } from "./strategies/InlineCompletionStrategy"
import { AutoTriggerStrategy } from "./strategies/AutoTriggerStrategy"

/**
 * Manages prompt strategies and selects the appropriate one based on context
 */
export class PromptStrategyManager {
	private strategies: PromptStrategy[]
	private debug: boolean

	constructor(options?: { debug: boolean }) {
		this.debug = options?.debug ?? false

		// Register all strategies in priority order
		this.strategies = [
			new UserRequestStrategy(),
			new SelectionRefactorStrategy(),
			new NewLineCompletionStrategy(),
			new CommentDrivenStrategy(),
			new InlineCompletionStrategy(),
			new AutoTriggerStrategy(),
			new ErrorFixStrategy(), // This need to be implemented in background
		]
	}

	/**
	 * Selects the most appropriate strategy for the given context
	 * @param context The suggestion context
	 * @returns The selected strategy
	 */
	selectStrategy(context: GhostSuggestionContext): PromptStrategy {
		// Find the first strategy that can handle this context
		for (const strategy of this.strategies) {
			if (strategy.canHandle(context)) {
				if (this.debug) {
					console.log(`[PromptStrategyManager] Selected strategy: ${strategy.name}`)
				}
				return strategy
			}
		}

		// Fallback: return the last strategy (AutoTriggerStrategy)
		const fallback = this.strategies[this.strategies.length - 1]
		if (this.debug) {
			console.log(`[PromptStrategyManager] Falling back to: ${fallback.name}`)
		}
		return fallback
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
		const strategy = this.selectStrategy(context)

		const systemPrompt = strategy.getSystemInstructions()
		const userPrompt = strategy.getUserPrompt(context)

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

	/**
	 * Gets all registered strategies (for testing/debugging)
	 * @returns Array of all strategies
	 */
	getStrategies(): PromptStrategy[] {
		return [...this.strategies]
	}
}
