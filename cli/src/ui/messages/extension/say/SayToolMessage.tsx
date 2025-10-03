import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { parseToolData, getToolIcon } from "../utils.js"

/**
 * Display tool execution results
 */
export const SayToolMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const toolData = parseToolData(message)

	if (!toolData) {
		return (
			<Box marginY={1}>
				<Text color="green">⚙ Tool Result (invalid data)</Text>
			</Box>
		)
	}

	const icon = getToolIcon(toolData.tool)

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="green" bold>
					{icon} {toolData.tool}
				</Text>
			</Box>

			{toolData.path && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="cyan">{toolData.path}</Text>
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
		</Box>
	)
}
