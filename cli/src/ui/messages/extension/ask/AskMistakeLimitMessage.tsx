import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"

/**
 * Display mistake limit reached error with red error styling
 */
export const AskMistakeLimitMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "mistake_limit_reached")

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="red" paddingX={1} marginY={1}>
			<Box>
				<Text color="red" bold>
					{icon} Mistake Limit Reached
				</Text>
			</Box>
			{message.text && (
				<Box marginTop={1}>
					<Text color="red">{message.text}</Text>
				</Box>
			)}
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
