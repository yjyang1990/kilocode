import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { parseToolData, getToolIcon } from "../utils.js"

/**
 * Display tool usage requests requiring approval
 * Parses tool data and shows tool information
 */
export const AskToolMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const toolData = parseToolData(message)

	if (!toolData) {
		return (
			<Box marginY={1}>
				<Text color="yellow" bold>
					⚙ Tool Request (invalid data)
				</Text>
			</Box>
		)
	}

	const icon = getToolIcon(toolData.tool)

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Tool Request: {toolData.tool}
				</Text>
			</Box>

			{toolData.path && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="cyan">Path: {toolData.path}</Text>
				</Box>
			)}

			{toolData.reason && (
				<Box marginLeft={2}>
					<Text color="gray" dimColor>
						Reason: {toolData.reason}
					</Text>
				</Box>
			)}

			{toolData.content && (
				<Box marginLeft={2} marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
					<Text color="white">
						{toolData.content.substring(0, 200)}
						{toolData.content.length > 200 ? "..." : ""}
					</Text>
				</Box>
			)}

			{message.isAnswered && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						✓ Answered
					</Text>
				</Box>
			)}
		</Box>
	)
}
