import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { MarkdownText } from "../../../components/MarkdownText.js"

/**
 * Display subtask results in a badge-styled box
 */
export const SaySubtaskResultMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginY={1}>
			<Box>
				<Text color="cyan" bold>
					📋 Subtask Result
				</Text>
			</Box>
			{message.text && (
				<Box marginTop={1}>
					<MarkdownText>{message.text}</MarkdownText>
				</Box>
			)}
		</Box>
	)
}
