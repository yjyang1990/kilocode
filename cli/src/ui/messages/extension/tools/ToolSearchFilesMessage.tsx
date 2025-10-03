import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display regex file search results
 */
export const ToolSearchFilesMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("searchFiles")
	const results = toolData.content ? toolData.content.split("\n").filter((line) => line.trim()) : []

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="cyan" bold>
					{icon} Search Files: {formatFilePath(toolData.path || "")}
				</Text>
				{toolData.isOutsideWorkspace && (
					<Text color="yellow" dimColor>
						{" "}
						⚠ Outside workspace
					</Text>
				)}
			</Box>

			<Box marginLeft={2} flexDirection="column">
				{toolData.regex && (
					<Box>
						<Text color="gray" dimColor>
							Pattern:{" "}
						</Text>
						<Text color="white">{toolData.regex}</Text>
					</Box>
				)}
				{toolData.filePattern && (
					<Box>
						<Text color="gray" dimColor>
							Files:{" "}
						</Text>
						<Text color="white">{toolData.filePattern}</Text>
					</Box>
				)}
			</Box>

			{results.length > 0 && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					{results.slice(0, 15).map((result, index) => (
						<Text key={index} color="gray">
							{truncateText(result, 80)}
						</Text>
					))}
					{results.length > 15 && (
						<Text color="gray" dimColor>
							... ({results.length - 15} more results)
						</Text>
					)}
				</Box>
			)}

			<Box marginLeft={2} marginTop={1}>
				<Text color="gray" dimColor>
					Found: {results.length} matches
				</Text>
			</Box>
		</Box>
	)
}
