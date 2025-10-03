import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"

/**
 * Display task completion result with success icon
 */
export const SayCompletionResultMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("say", "completion_result")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="green" bold>
					{icon} Task Completed
				</Text>
			</Box>

			{message.text && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="white">{message.text}</Text>
				</Box>
			)}
		</Box>
	)
}
