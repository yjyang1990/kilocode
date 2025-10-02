/**
 * MessageDisplay component - displays chat messages from both CLI and extension state
 * Updated to merge messages directly in component to avoid stale derived atom issues
 */

import React from "react"
import { Box, Text } from "ink"
import { useAtomValue } from "jotai"
import { type UnifiedMessage, mergedMessagesAtom } from "../../state/atoms/ui.js"
import { MessageRow } from "./MessageRow.js"

interface MessageDisplayProps {
	/** Optional filter to show only specific message types */
	filterType?: "ask" | "say"
	/** Maximum number of messages to display (default: all) */
	maxMessages?: number
}

/**
 * Generate a unique key for a unified message
 */
function getMessageKey(msg: UnifiedMessage, index: number): string {
	if (msg.source === "cli") {
		return `cli-${msg.message.id}`
	}
	return `ext-${msg.message.ts}`
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ filterType, maxMessages }) => {
	const allMessages = useAtomValue(mergedMessagesAtom)

	if (allMessages.length === 0) {
		return (
			<Box flexDirection="column" paddingX={1} paddingY={1}>
				<Text color="gray">No messages yet. Type a message or /help for available commands.</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" paddingX={1}>
			{allMessages.map((unifiedMsg, index) => (
				<MessageRow key={getMessageKey(unifiedMsg, index)} unifiedMessage={unifiedMsg} />
			))}
		</Box>
	)
}
