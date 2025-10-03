import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon, formatFilePath, truncateText } from "../utils.js"

/**
 * Display file edits with diff (handles both editedExistingFile and appliedDiff tool types)
 */
export const ToolEditedExistingFileMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon(toolData.tool)
	const isBatch = toolData.batchDiffs && toolData.batchDiffs.length > 0

	if (isBatch) {
		return (
			<Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1} marginY={1}>
				<Box>
					<Text color="cyan" bold>
						{icon} Edit Files ({toolData.batchDiffs!.length} files)
					</Text>
				</Box>
				<Box flexDirection="column" marginTop={1}>
					{toolData.batchDiffs!.map((batchDiff: any, index: number) => (
						<Box key={index} flexDirection="column" marginBottom={1}>
							<Text color="cyan">{formatFilePath(batchDiff.path || "")}</Text>
							{batchDiff.isProtected && (
								<Text color="yellow" dimColor>
									{" "}
									🔒 Protected
								</Text>
							)}
						</Box>
					))}
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="cyan" bold>
					{icon} Edit File: {formatFilePath(toolData.path || "")}
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

			{toolData.fastApplyResult && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="green" dimColor>
						✓ Fast apply
					</Text>
				</Box>
			)}
		</Box>
	)
}
