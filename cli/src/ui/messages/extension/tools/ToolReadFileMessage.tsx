import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath } from "../utils.js"

/**
 * Display file reading (single or batch)
 */
export const ToolReadFileMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("readFile")
	const isBatch = toolData.batchFiles && toolData.batchFiles.length > 0

	if (isBatch) {
		const totalFiles = toolData.batchFiles!.length + (toolData.additionalFileCount || 0)
		return (
			<Box flexDirection="column" borderStyle="single" borderColor="blue" paddingX={1} marginY={1}>
				<Box>
					<Text color="blue" bold>
						{icon} Read Files ({totalFiles} files)
					</Text>
				</Box>
				<Box flexDirection="column" marginTop={1}>
					{toolData.batchFiles!.map((file, index) => (
						<Text key={index} color="cyan">
							- {formatFilePath(file.path)}
						</Text>
					))}
					{toolData.additionalFileCount && toolData.additionalFileCount > 0 && (
						<Text color="gray" dimColor>
							... and {toolData.additionalFileCount} more files
						</Text>
					)}
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="blue" bold>
					{icon} Read File
				</Text>
			</Box>
			<Box marginLeft={2}>
				<Text color="cyan">{formatFilePath(toolData.path || "")}</Text>
				{toolData.isOutsideWorkspace && (
					<Text color="yellow" dimColor>
						{" "}
						⚠ Outside workspace
					</Text>
				)}
			</Box>
			{toolData.reason && (
				<Box marginLeft={2}>
					<Text color="gray" dimColor>
						Reason: {toolData.reason}
					</Text>
				</Box>
			)}
		</Box>
	)
}
