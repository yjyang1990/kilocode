import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display top-level file listing
 */
export const ToolListFilesTopLevelMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("listFilesTopLevel")
	const files = toolData.content ? toolData.content.split("\n").filter((line) => line.trim()) : []

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} List Files (Top Level): {formatFilePath(toolData.path || "")}
				</Text>
				{toolData.isOutsideWorkspace && (
					<Text color="yellow" dimColor>
						{" "}
						⚠ Outside workspace
					</Text>
				)}
			</Box>

			{files.length > 0 && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					{files.slice(0, 15).map((file, index) => (
						<Text key={index} color="gray">
							{truncateText(file, 80)}
						</Text>
					))}
					{files.length > 15 && (
						<Text color="gray" dimColor>
							... ({files.length - 15} more items)
						</Text>
					)}
				</Box>
			)}

			<Box marginLeft={2} marginTop={1}>
				<Text color="gray" dimColor>
					Total: {files.length} items
				</Text>
			</Box>
		</Box>
	)
}
