import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon } from "../utils.js"

/**
 * Display mode switching request
 */
export const ToolSwitchModeMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("switchMode")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="magenta" bold>
					{icon} Switch Mode
				</Text>
			</Box>

			<Box marginLeft={2} flexDirection="column">
				<Box>
					<Text color="gray" dimColor>
						To:{" "}
					</Text>
					<Text color="cyan">{toolData.mode || ""}</Text>
				</Box>
				{toolData.reason && (
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							Reason:{" "}
						</Text>
						<Text color="white">{toolData.reason}</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
