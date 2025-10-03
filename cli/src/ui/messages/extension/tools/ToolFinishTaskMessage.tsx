import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon } from "../utils.js"

/**
 * Display task completion
 */
export const ToolFinishTaskMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("finishTask")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="green" bold>
					{icon} Finish Task
				</Text>
			</Box>

			{toolData.content && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray">{toolData.content}</Text>
				</Box>
			)}
		</Box>
	)
}
