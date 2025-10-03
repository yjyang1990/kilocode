import React from "react"
import { Box, Text } from "ink"
import type { ToolMessageProps } from "../types.js"
import { getToolIcon } from "../utils.js"

/**
 * Display semantic codebase search
 */
export const ToolCodebaseSearchMessage: React.FC<ToolMessageProps> = ({ toolData }) => {
	const icon = getToolIcon("codebaseSearch")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="cyan" bold>
					{icon} Codebase Search
				</Text>
			</Box>

			<Box marginLeft={2} flexDirection="column">
				<Box>
					<Text color="gray" dimColor>
						Query:{" "}
					</Text>
					<Text color="white">{toolData.query || ""}</Text>
				</Box>
				{toolData.path && (
					<Box>
						<Text color="gray" dimColor>
							Path:{" "}
						</Text>
						<Text color="cyan">{toolData.path}</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
