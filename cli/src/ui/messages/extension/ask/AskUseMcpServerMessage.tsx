import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useAtomValue, useSetAtom } from "jotai"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon, parseMcpServerData } from "../utils.js"
import {
	setPendingApprovalAtom,
	shouldAutoApproveAtom,
	shouldAutoRejectAtom,
} from "../../../../state/atoms/approval.js"
import { ciModeAtom } from "../../../../state/atoms/ci.js"
import { useApprovalHandler } from "../../../../state/hooks/useApprovalHandler.js"
import { CI_MODE_MESSAGES } from "../../../../constants/ci.js"
import { logs } from "../../../../services/logs.js"

/**
 * Display MCP server usage request (tool or resource access)
 */
export const AskUseMcpServerMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const isCIMode = useAtomValue(ciModeAtom)
	const shouldAutoApprove = useAtomValue(shouldAutoApproveAtom)
	const shouldAutoReject = useAtomValue(shouldAutoRejectAtom)
	const { approve, reject } = useApprovalHandler()
	const icon = getMessageIcon("ask", "use_mcp_server")
	const mcpData = parseMcpServerData(message)

	// Set this message as pending approval if not already answered
	// In CI mode, handle auto-approval immediately to avoid race conditions
	useEffect(() => {
		if (!message.isAnswered && !message.partial) {
			setPendingApproval(message)

			// In CI mode, handle auto-approval/rejection immediately
			// This eliminates the race condition with the useApprovalHandler hook
			if (isCIMode) {
				const serverName = mcpData?.serverName || "unknown"
				const operation = mcpData?.type === "use_mcp_tool" ? "tool" : "resource"

				if (shouldAutoApprove) {
					logs.info(`CI mode: Auto-approving MCP ${operation}: ${serverName}`, "AskUseMcpServerMessage")
					approve().catch((error) => {
						logs.error("CI mode: Failed to auto-approve MCP operation", "AskUseMcpServerMessage", { error })
					})
				} else if (shouldAutoReject) {
					logs.info(`CI mode: Auto-rejecting MCP ${operation}: ${serverName}`, "AskUseMcpServerMessage")
					reject(CI_MODE_MESSAGES.AUTO_REJECTED).catch((error) => {
						logs.error("CI mode: Failed to auto-reject MCP operation", "AskUseMcpServerMessage", { error })
					})
				}
			}
		}

		// Clear pending approval when component unmounts
		return () => {
			setPendingApproval(null)
		}
	}, [
		message,
		message.isAnswered,
		message.partial,
		setPendingApproval,
		isCIMode,
		shouldAutoApprove,
		shouldAutoReject,
		approve,
		reject,
		mcpData,
	])

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
