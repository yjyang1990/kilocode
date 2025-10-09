import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display command output messages
 */
export const SayCommandOutputMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const text = message.text || ""

	// Don't render if there's no text
	if (!text.trim()) {
		return null
	}

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray" dimColor>
					{text}
				</Text>
			</Box>
		</Box>
	)
}
