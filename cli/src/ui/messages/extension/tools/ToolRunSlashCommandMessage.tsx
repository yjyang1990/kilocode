import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon } from "../utils.js"

/**
 * Display slash command execution
 */
export const ToolRunSlashCommandMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("runSlashCommand")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="magenta" bold>
					{icon} Run Slash Command
				</Text>
			</Box>

			<Box marginLeft={2} flexDirection="column">
				<Box>
					<Text color="gray" dimColor>
						Command:{" "}
					</Text>
					<Text color="cyan">/{toolData.command || ""}</Text>
				</Box>
				{toolData.args && (
					<Box>
						<Text color="gray" dimColor>
							Args:{" "}
						</Text>
						<Text color="white">{toolData.args}</Text>
					</Box>
				)}
				{toolData.description && (
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							Description:{" "}
						</Text>
						<Text color="white">{toolData.description}</Text>
					</Box>
				)}
				{toolData.source && (
					<Box>
						<Text color="gray" dimColor>
							Source:{" "}
						</Text>
						<Text color="gray">{toolData.source}</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
