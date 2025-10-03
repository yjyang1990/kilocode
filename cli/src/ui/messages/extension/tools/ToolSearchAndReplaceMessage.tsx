import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display search and replace operations
 */
export const ToolSearchAndReplaceMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("searchAndReplace")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="magenta" bold>
					{icon} Search & Replace: {formatFilePath(toolData.path || "")}
				</Text>
				{toolData.isProtected && (
					<Text color="yellow" dimColor>
						{" "}
						🔒 Protected
					</Text>
				)}
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
							const color = line.startsWith("+")
								? "green"
								: line.startsWith("-")
									? "red"
									: line.startsWith("@@")
										? "cyan"
										: "gray"
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
