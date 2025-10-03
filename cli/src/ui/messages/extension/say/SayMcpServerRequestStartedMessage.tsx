import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display MCP server request started
 */
export const SayMcpServerRequestStartedMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box marginY={1}>
			<Text color="cyan">⚙ MCP Server Request in progress...</Text>
		</Box>
	)
}
