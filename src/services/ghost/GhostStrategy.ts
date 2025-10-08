import { GhostSuggestionContext } from "./types"
import { GhostStreamingParser, StreamingParseResult } from "./GhostStreamingParser"
import { PromptStrategyManager } from "./PromptStrategyManager"

export class GhostStrategy {
	private streamingParser: GhostStreamingParser
	private strategyManager: PromptStrategyManager
	private debug: boolean

	constructor(options?: { debug: boolean }) {
		this.streamingParser = new GhostStreamingParser()
		this.strategyManager = new PromptStrategyManager(options)
		this.debug = options?.debug ?? false
	}

	/**
	 * Get both system and user prompts based on context
	 * @param context The suggestion context
	 * @returns Object containing systemPrompt and userPrompt
	 */
	getPrompts(context: GhostSuggestionContext): { systemPrompt: string; userPrompt: string } {
		const { systemPrompt, userPrompt, strategy } = this.strategyManager.buildPrompt(context)
		if (this.debug) {
			console.log(`[GhostStrategy] Using strategy: ${strategy.name}`)
		}
		return { systemPrompt, userPrompt }
	}

	/**
	 * Get the system prompt based on context using the new strategy system
	 * @deprecated Use getPrompts() instead for better performance
	 */
	getSystemPrompt(context: GhostSuggestionContext): string {
		return this.getPrompts(context).systemPrompt
	}

	/**
	 * Get the user prompt based on context using the new strategy system
	 * @param context The suggestion context
	 * @returns The user prompt
	 * @deprecated Use getPrompts() instead for better performance
	 */
	getSuggestionPrompt(context: GhostSuggestionContext): string {
		return this.getPrompts(context).userPrompt
	}

	/**
	 * Initialize streaming parser for incremental parsing
	 */
	public initializeStreamingParser(context: GhostSuggestionContext): void {
		this.streamingParser.initialize(context)
	}

	/**
	 * Process a chunk of streaming response and return any newly completed suggestions
	 */
	public processStreamingChunk(chunk: string): StreamingParseResult {
		return this.streamingParser.processChunk(chunk)
	}

	/**
	 * Reset the streaming parser for a new parsing session
	 */
	public resetStreamingParser(): void {
		this.streamingParser.reset()
	}

	/**
	 * Finish the streaming parser and apply sanitization if needed
	 */
	public finishStreamingParser(): StreamingParseResult {
		return this.streamingParser.finishStream()
	}

	/**
	 * Get the current buffer content from the streaming parser (for debugging)
	 */
	public getStreamingBuffer(): string {
		return this.streamingParser.getBuffer()
	}

	/**
	 * Get completed changes from the streaming parser (for debugging)
	 */
	public getStreamingCompletedChanges() {
		return this.streamingParser.getCompletedChanges()
	}
}
