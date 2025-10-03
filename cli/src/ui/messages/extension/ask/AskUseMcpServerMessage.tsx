import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon, parseMcpServerData } from "../utils.js"

/**
 * Display MCP server usage request (tool or resource access)
 */
export const AskUseMcpServerMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "use_mcp_server")
	const mcpData = parseMcpServerData(message)

	if (!mcpData) {
		return (
			<Box marginY={1}>
				<Text color="yellow" bold>
					{icon} MCP Server Request (invalid data)
				</Text>
			</Box>
		)
	}

	const isToolUse = mcpData.type === "use_mcp_tool"
	const title = isToolUse ? "Use MCP Tool" : "Access MCP Resource"

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} {title}
				</Text>
			</Box>

			<Box marginLeft={2} marginTop={1}>
				<Text color="cyan">Server: {mcpData.serverName}</Text>
			</Box>

			{isToolUse && mcpData.toolName && (
				<Box marginLeft={2}>
					<Text color="white">Tool: {mcpData.toolName}</Text>
				</Box>
			)}

			{!isToolUse && mcpData.uri && (
				<Box marginLeft={2}>
					<Text color="white">URI: {mcpData.uri}</Text>
				</Box>
			)}

			{mcpData.arguments && (
				<Box marginLeft={2} marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
					<Text color="gray" dimColor>
						Arguments: {mcpData.arguments.substring(0, 100)}
						{mcpData.arguments.length > 100 ? "..." : ""}
					</Text>
				</Box>
			)}

			{message.isAnswered && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						✓ Answered
					</Text>
				</Box>
			)}
		</Box>
	)
}
