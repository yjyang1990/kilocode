import OpenAI from "openai"
import type { ApiHandlerCreateMessageMetadata } from "../../index"
import type { ApiStreamNativeToolCallsChunk } from "../../transform/stream"

/**
 * Adds native tool call parameters to OpenAI chat completion params when toolStyle is "json"
 *
 * @param params - The OpenAI chat completion parameters to augment
 * @param options - Provider options containing toolStyle configuration
 * @param metadata - Optional metadata that may contain allowedTools
 * @returns Augmented parameters with native tool call settings
 */
export function addNativeToolCallsToParams<T extends OpenAI.Chat.ChatCompletionCreateParams>(
	params: T,
	options: { toolStyle?: "xml" | "json" },
	metadata?: ApiHandlerCreateMessageMetadata,
): T {
	// Set parallel_tool_calls to false to ensure sequential tool execution
	params.parallel_tool_calls = false

	// When toolStyle is "json" and allowedTools exist, add them to params
	if (options.toolStyle === "json" && metadata?.allowedTools) {
		params.tools = metadata.allowedTools
		params.tool_choice = "required" as const
	}

	return params
}

/**
 * Processes native tool calls from OpenAI streaming delta responses
 *
 * @param delta - The delta object from a streaming response
 * @param toolStyle - The tool style configuration of the provider
 * @yields ApiStreamNativeToolCallsChunk when valid tool calls are found in JSON mode
 */
export function* processNativeToolCallsFromDelta(
	delta: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta | undefined,
	toolStyle: "xml" | "json" | undefined,
): Generator<ApiStreamNativeToolCallsChunk, void, undefined> {
	// Check if delta contains tool calls
	if (delta && delta.tool_calls && delta.tool_calls.length > 0) {
		// Only process tool calls when toolStyle is "json"
		if (toolStyle === "json") {
			// Filter tool calls to keep only those with function data
			// Map to the ApiStreamNativeToolCallsChunk format
			const validToolCalls = delta.tool_calls
				.filter((tc) => tc.function) // Keep any delta with function data
				.map((tc) => ({
					index: tc.index, // Use index to track across deltas
					id: tc.id, // Only present in first delta
					type: tc.type,
					function: {
						name: tc.function!.name || "", // Name only in first delta
						arguments: tc.function!.arguments || "", // Arguments accumulate across deltas
					},
				}))

			// If we have valid tool calls, yield them as a chunk
			if (validToolCalls.length > 0) {
				yield {
					type: "native_tool_calls",
					toolCalls: validToolCalls,
				}
			}
		} else {
			// Log error when model tries to use native tool calls but toolStyle is not "json"
			console.error("Model tried to use native tool calls but toolStyle is not 'json'", delta.tool_calls)
		}
	}
}
