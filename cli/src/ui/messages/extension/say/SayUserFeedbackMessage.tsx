import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display user feedback messages
 */
export const SayUserFeedbackMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue" paddingX={1} marginY={1}>
			<Box>
				<Text color="blue" bold>
					💬 User Feedback
				</Text>
			</Box>
			{message.text && (
				<Box marginTop={1}>
					<Text color="white">{message.text}</Text>
				</Box>
			)}
		</Box>
	)
}
