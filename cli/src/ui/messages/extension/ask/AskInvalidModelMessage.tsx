import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"

/**
 * Display invalid model selection warning
 */
export const AskInvalidModelMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "invalid_model")

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1} marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Invalid Model Selection
				</Text>
			</Box>

			{message.text && (
				<Box marginTop={1}>
					<Text color="yellow">{message.text}</Text>
				</Box>
			)}

			<Box marginTop={1}>
				<Text color="gray" dimColor>
					The selected model is not available or invalid. Please choose a different model.
				</Text>
			</Box>

			{message.isAnswered && (
				<Box marginTop={1}>
					<Text color="gray" dimColor>
						✓ Answered
					</Text>
				</Box>
			)}
		</Box>
	)
}
