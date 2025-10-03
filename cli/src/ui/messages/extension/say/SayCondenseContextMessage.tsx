import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display context condensing status (in progress or complete)
 */
export const SayCondenseContextMessage: React.FC<MessageComponentProps> = ({ message }) => {
	// In progress state
	if (message.partial) {
		return (
			<Box marginY={1}>
				<Text color="cyan">📦 Condensing context...</Text>
			</Box>
		)
	}

	// Complete state
	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="green" bold>
					✓ Context Condensed
				</Text>
			</Box>

			{message.text && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						{message.text}
					</Text>
				</Box>
			)}
		</Box>
	)
}
