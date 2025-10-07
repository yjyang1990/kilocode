import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useAtomValue, useSetAtom } from "jotai"
import type { MessageComponentProps } from "../types.js"
import { parseToolData, getToolIcon } from "../utils.js"
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
 * Display tool usage requests requiring approval
 * Parses tool data and shows tool information
 */
export const AskToolMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const isCIMode = useAtomValue(ciModeAtom)
	const shouldAutoApprove = useAtomValue(shouldAutoApproveAtom)
	const shouldAutoReject = useAtomValue(shouldAutoRejectAtom)
	const { approve, reject } = useApprovalHandler()
	const toolData = parseToolData(message)

	// Set this message as pending approval if not already answered
	// In CI mode, handle auto-approval immediately to avoid race conditions
	useEffect(() => {
		if (!message.isAnswered && !message.partial) {
			setPendingApproval(message)

			// In CI mode, handle auto-approval/rejection immediately
			// This eliminates the race condition with the useApprovalHandler hook
			if (isCIMode) {
				const tool = toolData?.tool || "unknown"

				if (shouldAutoApprove) {
					logs.info(`CI mode: Auto-approving tool: ${tool}`, "AskToolMessage")
					approve().catch((error) => {
						logs.error("CI mode: Failed to auto-approve tool", "AskToolMessage", { error })
					})
				} else if (shouldAutoReject) {
					logs.info(`CI mode: Auto-rejecting tool: ${tool}`, "AskToolMessage")
					reject(CI_MODE_MESSAGES.AUTO_REJECTED).catch((error) => {
						logs.error("CI mode: Failed to auto-reject tool", "AskToolMessage", { error })
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
		toolData,
	])

	if (!toolData) {
		return (
			<Box marginY={1}>
				<Text color="yellow" bold>
					⚙ Tool Request (invalid data)
				</Text>
			</Box>
		)
	}

	const icon = getToolIcon(toolData.tool)

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Tool Request: {toolData.tool}
				</Text>
			</Box>

			{toolData.path && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="cyan">Path: {toolData.path}</Text>
				</Box>
			)}

			{toolData.reason && (
				<Box marginLeft={2}>
					<Text color="gray" dimColor>
						Reason: {toolData.reason}
					</Text>
				</Box>
			)}

			{toolData.content && (
				<Box marginLeft={2} marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
					<Text color="white">
						{toolData.content.substring(0, 200)}
						{toolData.content.length > 200 ? "..." : ""}
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
