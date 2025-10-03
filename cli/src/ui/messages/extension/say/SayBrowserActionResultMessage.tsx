import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display browser action results
 */
export const SayBrowserActionResultMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="cyan" bold>
					🌐 Browser Action Result
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
