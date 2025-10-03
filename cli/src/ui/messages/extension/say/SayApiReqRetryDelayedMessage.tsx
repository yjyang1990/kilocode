import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display API request retry delayed
 */
export const SayApiReqRetryDelayedMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box marginY={1}>
			<Text color="yellow">⏳ API Request retry delayed...</Text>
			{message.text && (
				<Text color="gray" dimColor>
					{" "}
					{message.text}
				</Text>
			)}
		</Box>
	)
}
