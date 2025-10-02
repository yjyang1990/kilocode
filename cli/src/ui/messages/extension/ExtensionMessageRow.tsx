import React from "react"
import { Box, Text } from "ink"
import type { ExtensionChatMessage } from "../../../types/messages.js"

interface ExtensionMessageRowProps {
	message: ExtensionChatMessage
}

export const ExtensionMessageRow: React.FC<ExtensionMessageRowProps> = ({ message }) => {
	const getColor = () => {
		switch (message.type) {
			case "ask":
				return "yellow"
			case "say":
				return "green"
			default:
				return "white"
		}
	}

	const getPrefix = () => {
		switch (message.type) {
			case "ask":
				return "?"
			case "say":
				return ">"
			default:
				return " "
		}
	}

	// Get the display text based on message type
	const getDisplayText = () => {
		if (message.type === "ask") {
			return message.ask || message.text || ""
		}
		if (message.type === "say") {
			return message.say || message.text || ""
		}
		return message.text || ""
	}

	const displayText = getDisplayText()

	// Don't render if there's no text
	if (!displayText) {
		return null
	}

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				<Text color={getColor()} bold>
					{getPrefix()}{" "}
				</Text>
				<Text color="white">{displayText}</Text>
				{message.partial && (
					<Text color="gray" dimColor>
						{" "}
						...
					</Text>
				)}
			</Box>
			{message.isAnswered && message.type === "ask" && (
				<Box marginLeft={2}>
					<Text color="gray" dimColor>
						✓ Answered
					</Text>
				</Box>
			)}
		</Box>
	)
}
