import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display new file creation with content preview
 */
export const ToolNewFileCreatedMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("newFileCreated")
	const lines = toolData.content ? toolData.content.split("\n") : []

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="green" bold>
					{icon} New File: {formatFilePath(toolData.path || "")}
				</Text>
				{toolData.isProtected && (
					<Text color="yellow" dimColor>
						{" "}
						🔒 Protected
					</Text>
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

			{toolData.fastApplyResult && (
				<Box marginLeft={2}>
					<Text color="green" dimColor>
						✓ Fast apply
					</Text>
				</Box>
			)}
		</Box>
	)
}
