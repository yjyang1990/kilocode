import type { TextDocument, Range, Diagnostic } from "vscode"
import { GhostSuggestionContext } from "../types"
import { PromptStrategy, UseCaseType } from "../types/PromptStrategy"

/**
 * Abstract base class for all prompt strategies
 * Provides common functionality and enforces consistent structure
 */
export abstract class BasePromptStrategy implements PromptStrategy {
	/**
	 * Human-readable name of the strategy
	 */
	abstract name: string

	/**
	 * The use case type this strategy handles
	 */
	abstract type: UseCaseType

	/**
	 * Determines if this strategy can handle the given context
	 */
	abstract canHandle(context: GhostSuggestionContext): boolean

	/**
	 * Gets the base system instructions that apply to all strategies
	 */

	/**
	 * Gets strategy-specific system instructions
	 * Must be implemented by each strategy
	 */
	abstract getSystemInstructions(): string

	/**
	 * Generates the user prompt with context
	 */
	abstract getUserPrompt(context: GhostSuggestionContext): string
}
