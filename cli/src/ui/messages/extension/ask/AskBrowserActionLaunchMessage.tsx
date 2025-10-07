import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useAtomValue, useSetAtom } from "jotai"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"
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
 * Display browser action launch request
 */
export const AskBrowserActionLaunchMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const isCIMode = useAtomValue(ciModeAtom)
	const shouldAutoApprove = useAtomValue(shouldAutoApproveAtom)
	const shouldAutoReject = useAtomValue(shouldAutoRejectAtom)
	const { approve, reject } = useApprovalHandler()
	const icon = getMessageIcon("ask", "browser_action_launch")

	// Parse browser action data
	let url = ""
	try {
		const data = JSON.parse(message.text || "{}")
		url = data.url || ""
	} catch {
		// Keep empty url
	}

	// Set this message as pending approval if not already answered
	// In CI mode, handle auto-approval immediately to avoid race conditions
	useEffect(() => {
		if (!message.isAnswered && !message.partial) {
			setPendingApproval(message)

			// In CI mode, handle auto-approval/rejection immediately
			// This eliminates the race condition with the useApprovalHandler hook
			if (isCIMode) {
				if (shouldAutoApprove) {
					logs.info(`CI mode: Auto-approving browser action: ${url}`, "AskBrowserActionLaunchMessage")
					approve().catch((error) => {
						logs.error("CI mode: Failed to auto-approve browser action", "AskBrowserActionLaunchMessage", {
							error,
						})
					})
				} else if (shouldAutoReject) {
					logs.info(`CI mode: Auto-rejecting browser action: ${url}`, "AskBrowserActionLaunchMessage")
					reject(CI_MODE_MESSAGES.AUTO_REJECTED).catch((error) => {
						logs.error("CI mode: Failed to auto-reject browser action", "AskBrowserActionLaunchMessage", {
							error,
						})
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
		url,
	])

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Browser Action Request
				</Text>
			</Box>

			{url && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="cyan">URL: {url}</Text>
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
