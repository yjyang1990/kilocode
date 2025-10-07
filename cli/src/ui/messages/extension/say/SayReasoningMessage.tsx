import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { MarkdownText } from "../../../components/MarkdownText.js"

/**
 * Display AI reasoning/thinking process in a bordered box
 */
export const SayReasoningMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box flexDirection="column" borderStyle="single" borderColor="magenta" paddingX={1} marginY={1}>
			<Box>
				<Text color="magenta" bold>
					💭 Reasoning
				</Text>
			</Box>
			{message.text && (
				<Box marginTop={1}>
					<MarkdownText>{message.text}</MarkdownText>
					{message.partial && (
						<Text color="gray" dimColor>
							{" "}
							...
						</Text>
					)}
				</Box>
			)}
		</Box>
	)
}
