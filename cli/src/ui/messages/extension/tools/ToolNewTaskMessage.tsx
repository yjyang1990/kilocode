import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, truncateText } from "../utils.js"

/**
 * Display new subtask creation
 */
export const ToolNewTaskMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("newTask")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="blue" bold>
					{icon} New Subtask
				</Text>
			</Box>

			<Box marginLeft={2} flexDirection="column">
				{toolData.mode && (
					<Box>
						<Text color="gray" dimColor>
							Mode:{" "}
						</Text>
						<Text color="cyan">{toolData.mode}</Text>
					</Box>
				)}
			</Box>

			{toolData.content && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					{toolData.content
						.split("\n")
						.slice(0, 5)
						.map((line, index) => (
							<Text key={index} color="white">
								{truncateText(line, 80)}
							</Text>
						))}
					{toolData.content.split("\n").length > 5 && (
						<Text color="gray" dimColor>
							... ({toolData.content.split("\n").length - 5} more lines)
						</Text>
					)}
				</Box>
			)}
		</Box>
	)
}
