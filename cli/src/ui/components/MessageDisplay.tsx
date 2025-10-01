/**
 * MessageDisplay component - displays chat messages in a scrollable area
 */

import React from "react"
import { Box, Text } from "ink"
import type { Message } from "../../types/ui.js"

interface MessageDisplayProps {
	messages: Message[]
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages }) => {
	if (messages.length === 0) {
		return (
			<Box flexDirection="column" paddingX={1} paddingY={1}>
				<Text color="gray">No messages yet. Type a message or /help for available commands.</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" paddingX={1}>
			{messages.map((message) => (
				<MessageRow key={message.id} message={message} />
			))}
		</Box>
	)
}

interface MessageRowProps {
	message: Message
}

const MessageRow: React.FC<MessageRowProps> = ({ message }) => {
	const getColor = () => {
		switch (message.type) {
			case "user":
				return "cyan"
			case "assistant":
				return "green"
			case "system":
				return "yellow"
			case "error":
				return "red"
			default:
				return "white"
		}
	}

	const getPrefix = () => {
		switch (message.type) {
			case "user":
				return ">"
			case "assistant":
				return "<"
			case "system":
				return "ℹ"
			case "error":
				return "✖"
			default:
				return " "
		}
	}

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				<Text color={getColor()} bold>
					{getPrefix()}{" "}
				</Text>
				<Text color={"white"}>{message.content}</Text>
				{message.partial && (
					<Text color="gray" dimColor>
						{" "}
						...
					</Text>
				)}
			</Box>
		</Box>
	)
}
