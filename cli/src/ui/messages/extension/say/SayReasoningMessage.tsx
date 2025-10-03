import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

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
					<Text color="white">{message.text}</Text>
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
