import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display image generation request
 */
export const ToolGenerateImageMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("generateImage")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="magenta" bold>
					{icon} Generate Image: {formatFilePath(toolData.path || "")}
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

			{toolData.content && (
				<Box
					flexDirection="column"
					borderStyle="single"
					borderColor="gray"
					paddingX={1}
					marginTop={1}
					marginLeft={2}>
					<Text color="gray" dimColor>
						Prompt:
					</Text>
					<Text color="white">{truncateText(toolData.content, 200)}</Text>
				</Box>
			)}
		</Box>
	)
}
