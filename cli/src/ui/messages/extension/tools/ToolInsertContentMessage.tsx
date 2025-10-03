import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display content insertion at specific line
 */
export const ToolInsertContentMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("insertContent")
	const lineText = toolData.lineNumber === 0 ? "end of file" : `line ${toolData.lineNumber}`

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="green" bold>
					{icon} Insert Content: {formatFilePath(toolData.path || "")}
				</Text>
				{toolData.isProtected && (
					<Text color="yellow" dimColor>
						{" "}
						🔒 Protected
					</Text>
				)}
				{toolData.isOutsideWorkspace && (
					<Text color="yellow" dimColor>
						{" "}
						⚠ Outside workspace
					</Text>
				)}
			</Box>

			<Box marginLeft={2}>
				<Text color="gray" dimColor>
					At {lineText}
				</Text>
			</Box>

			{toolData.diff && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					{toolData.diff
						.split("\n")
						.slice(0, 10)
						.map((line, index) => {
							const color = line.startsWith("+") ? "green" : "gray"
							return (
								<Text key={index} color={color}>
									{truncateText(line, 80)}
								</Text>
							)
						})}
					{toolData.diff.split("\n").length > 10 && (
						<Text color="gray" dimColor>
							... ({toolData.diff.split("\n").length - 10} more lines)
						</Text>
					)}
				</Box>
			)}
		</Box>
	)
}
