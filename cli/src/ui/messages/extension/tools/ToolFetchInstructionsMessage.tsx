import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, truncateText } from "../utils.js"

/**
 * Display fetched instructions
 */
export const ToolFetchInstructionsMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("fetchInstructions")
	const lines = toolData.content ? toolData.content.split("\n") : []

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="blue" bold>
					{icon} Fetch Instructions
				</Text>
			</Box>

			{toolData.content && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					{lines.slice(0, 10).map((line, index) => (
						<Text key={index} color="gray">
							{truncateText(line, 80)}
						</Text>
					))}
					{lines.length > 10 && (
						<Text color="gray" dimColor>
							... ({lines.length - 10} more lines)
						</Text>
					)}
				</Box>
			)}

			<Box marginLeft={2} marginTop={1}>
				<Text color="gray" dimColor>
					Lines: {lines.length}
				</Text>
			</Box>
		</Box>
	)
}
