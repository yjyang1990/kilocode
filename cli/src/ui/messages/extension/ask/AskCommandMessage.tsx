import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useAtomValue, useSetAtom } from "jotai"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon, parseToolData } from "../utils.js"
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
 * Display command execution request with terminal icon and command in a bordered box
 */
export const AskCommandMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const isCIMode = useAtomValue(ciModeAtom)
	const shouldAutoApprove = useAtomValue(shouldAutoApproveAtom)
	const shouldAutoReject = useAtomValue(shouldAutoRejectAtom)
	const { approve, reject } = useApprovalHandler()
	const icon = getMessageIcon("ask", "command")
	const toolData = parseToolData(message)

	// Set this message as pending approval if not already answered
	// In CI mode, handle auto-approval immediately to avoid race conditions
	useEffect(() => {
		if (!message.isAnswered && !message.partial) {
			setPendingApproval(message)

			// In CI mode, handle auto-approval/rejection immediately
			// This eliminates the race condition with the useApprovalHandler hook
			if (isCIMode) {
				const command = toolData?.command || message.text || ""

				if (shouldAutoApprove) {
					logs.info(`CI mode: Auto-approving command: ${command}`, "AskCommandMessage")
					approve().catch((error) => {
						logs.error("CI mode: Failed to auto-approve command", "AskCommandMessage", { error })
					})
				} else if (shouldAutoReject) {
					logs.info(`CI mode: Auto-rejecting command: ${command}`, "AskCommandMessage")
					reject(CI_MODE_MESSAGES.AUTO_REJECTED).catch((error) => {
						logs.error("CI mode: Failed to auto-reject command", "AskCommandMessage", { error })
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

	// Extract command from toolData or message text
	const command = toolData?.command || message.text || ""
	const cwd = toolData?.path

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Command Request
				</Text>
			</Box>

			{command && (
				<Box marginLeft={2} marginTop={1} borderStyle="single" borderColor="yellow" paddingX={1}>
					<Text color="white">{command}</Text>
				</Box>
			)}

			{cwd && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						Working directory: {cwd}
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
