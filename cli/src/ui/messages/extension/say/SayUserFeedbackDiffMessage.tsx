import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { parseToolData, truncateText } from "../utils.js"

/**
 * Display user feedback with diff content
 */
export const SayUserFeedbackDiffMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const toolData = parseToolData(message)

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue" paddingX={1} marginY={1}>
			<Box>
				<Text color="blue" bold>
					💬 User Feedback (with changes)
				</Text>
			</Box>

			{toolData?.path && (
				<Box marginTop={1}>
					<Text color="cyan">File: {toolData.path}</Text>
				</Box>
			)}

			{toolData?.diff && (
				<Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
					<Text color="white">{truncateText(toolData.diff, 300)}</Text>
				</Box>
			)}

			{message.text && !toolData && (
				<Box marginTop={1}>
					<Text color="white">{message.text}</Text>
				</Box>
			)}
		</Box>
	)
}
