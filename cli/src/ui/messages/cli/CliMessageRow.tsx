import React from "react"
import { Box, Text } from "ink"
import type { CliMessage } from "../../../types/cli.js"

interface CliMessageRowProps {
	message: CliMessage
}

export const CliMessageRow: React.FC<CliMessageRowProps> = ({ message }) => {
	const getColor = () => {
		switch (message.type) {
			case "user":
				return "blue"
			case "assistant":
				return "green"
			case "system":
				return "gray"
			case "error":
				return "red"
			default:
				return "white"
		}
	}

	const getPrefix = () => {
		switch (message.type) {
			case "user":
				return "→"
			case "assistant":
				return "←"
			case "system":
				return "ℹ"
			case "error":
				return "✗"
			default:
				return " "
		}
	}

	// Don't render if there's no content
	if (!message.content) {
		return null
	}

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				<Text color={getColor()} bold>
					{getPrefix()}{" "}
				</Text>
				<Text color="white">{message.content}</Text>
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
