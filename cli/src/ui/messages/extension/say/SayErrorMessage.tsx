import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display error messages with red bordered box
 */
export const SayErrorMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box flexDirection="column" borderStyle="single" borderColor="red" paddingX={1} marginY={1}>
			<Box>
				<Text color="red" bold>
					✖ Error
				</Text>
			</Box>
			{message.text && (
				<Box marginTop={1}>
					<Text color="red">{message.text}</Text>
				</Box>
			)}
		</Box>
	)
}
