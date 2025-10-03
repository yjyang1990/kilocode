import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display code definitions listing
 */
export const ToolListCodeDefinitionNamesMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("listCodeDefinitionNames")
	const definitions = toolData.content ? toolData.content.split("\n").filter((line) => line.trim()) : []

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="blue" bold>
					{icon} List Code Definitions: {formatFilePath(toolData.path || "")}
				</Text>
				{toolData.isOutsideWorkspace && (
					<Text color="yellow" dimColor>
						{" "}
						⚠ Outside workspace
					</Text>
				)}
			</Box>

			{definitions.length > 0 && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					{definitions.slice(0, 15).map((def, index) => (
						<Text key={index} color="cyan">
							{truncateText(def, 80)}
						</Text>
					))}
					{definitions.length > 15 && (
						<Text color="gray" dimColor>
							... ({definitions.length - 15} more definitions)
						</Text>
					)}
				</Box>
			)}

			<Box marginLeft={2} marginTop={1}>
				<Text color="gray" dimColor>
					Total: {definitions.length} definitions
				</Text>
			</Box>
		</Box>
	)
}
