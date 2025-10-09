/**
 * Message completion utilities for determining when messages are ready for static rendering
 *
 * This module provides logic to determine if messages are "complete" and can be moved
 * to the static rendering section, preventing unnecessary re-renders and improving performance.
 */

import type { UnifiedMessage } from "../../../state/atoms/ui.js"
import type { ExtensionChatMessage } from "../../../types/messages.js"
import type { CliMessage } from "../../../types/cli.js"
import { parseApiReqInfo } from "../extension/utils.js"

/**
 * Determines if a CLI message is complete
 * CLI messages are complete when they are not marked as partial
 */
function isCliMessageComplete(message: CliMessage): boolean {
	return message.partial !== true
}

/**
 * Determines if an extension message is complete based on its type and state
 *
 * Completion rules:
 * - Messages with partial=true are never complete
 * - api_req_started requires specific completion indicators
 * - ask messages require isAnswered=true
 * - All other messages are complete if not partial
 */
function isExtensionMessageComplete(message: ExtensionChatMessage): boolean {
	// Handle partial flag first - if partial is explicitly true, not complete
	if (message.partial === true) {
		return false
	}

	// Special handling for api_req_started
	// This message type needs additional attributes to be considered complete
	if (message.say === "api_req_started") {
		const apiInfo = parseApiReqInfo(message)
		// Complete if it has a failure, cancellation, or cost (success)
		return !!(apiInfo?.streamingFailedMessage || apiInfo?.cancelReason || apiInfo?.cost !== undefined)
	}

	// Ask messages need to be answered to be complete
	if (message.type === "ask") {
		return message.isAnswered === true
	}

	// All other messages are complete if not partial
	return true
}

/**
 * Determines if a unified message is complete
 * Routes to appropriate completion checker based on message source
 */
export function isMessageComplete(message: UnifiedMessage): boolean {
	if (message.source === "cli") {
		return isCliMessageComplete(message.message)
	}
	return isExtensionMessageComplete(message.message)
}

/**
 * Splits messages into static (complete) and dynamic (incomplete) arrays
 *
 * IMPORTANT: Ensures sequential completion - a message can only be marked as static
 * if ALL previous messages are also complete. This prevents:
 * - Mixed ordering in the static section
 * - Partial messages appearing before completed ones
 * - Visual jumping when messages complete out of order
 *
 * @param messages - Array of unified messages in chronological order
 * @returns Object with staticMessages (complete) and dynamicMessages (incomplete)
 */
export function splitMessages(messages: UnifiedMessage[]): {
	staticMessages: UnifiedMessage[]
	dynamicMessages: UnifiedMessage[]
} {
	let lastCompleteIndex = -1

	// Find the last consecutive index where all messages up to that point are complete
	for (let i = 0; i < messages.length; i++) {
		if (isMessageComplete(messages[i]!)) {
			// Only advance if this is the next consecutive complete message
			if (i === 0 || i === lastCompleteIndex + 1) {
				lastCompleteIndex = i
			} else {
				// Gap found - an earlier message is incomplete, stop here
				break
			}
		} else {
			// Incomplete message found - stop here
			break
		}
	}

	return {
		staticMessages: messages.slice(0, lastCompleteIndex + 1),
		dynamicMessages: messages.slice(lastCompleteIndex + 1),
	}
}
