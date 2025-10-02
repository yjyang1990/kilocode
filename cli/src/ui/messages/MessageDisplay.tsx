/**
 * MessageDisplay component - displays chat messages from both CLI and extension state
 * Updated to use mergedMessagesAtom for unified message display
 */

import React, { useMemo } from "react"
import { Box, Text } from "ink"
import { useAtomValue } from "jotai"
import { mergedMessagesAtom, type UnifiedMessage } from "../../state/atoms/ui.js"
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

	// Filter and limit messages
	const displayMessages = useMemo(() => {
		let filtered = allMessages

		// Apply filter only to extension messages if filterType is specified
		if (filterType) {
			filtered = allMessages.filter((msg) => msg.source === "extension" && msg.message.type === filterType)
		}

		if (maxMessages && maxMessages > 0) {
			filtered = filtered.slice(-maxMessages)
		}

		return filtered
	}, [allMessages, filterType, maxMessages])

	if (allMessages.length === 0) {
		return (
			<Box flexDirection="column" paddingX={1} paddingY={1}>
				<Text color="gray">No messages yet. Type a message or /help for available commands.</Text>
			</Box>
		)
	}

	if (displayMessages.length === 0) {
		return (
			<Box flexDirection="column" paddingX={1} paddingY={1}>
				<Text color="gray">No {filterType} messages.</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" paddingX={1}>
			{displayMessages.map((unifiedMsg, index) => (
				<MessageRow key={getMessageKey(unifiedMsg, index)} unifiedMessage={unifiedMsg} />
			))}
		</Box>
	)
}
