import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useSetAtom } from "jotai"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"
import { setPendingApprovalAtom } from "../../../../state/atoms/approval.js"

/**
 * Display browser action launch request
 */
export const AskBrowserActionLaunchMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const icon = getMessageIcon("ask", "browser_action_launch")

	// Set this message as pending approval if not already answered
	useEffect(() => {
		if (!message.isAnswered && !message.partial) {
			setPendingApproval(message)
		}

		// Clear pending approval when component unmounts
		return () => {
			setPendingApproval(null)
		}
	}, [message, message.isAnswered, message.partial, setPendingApproval])

	// Parse browser action data
	let url = ""
	try {
		const data = JSON.parse(message.text || "{}")
		url = data.url || ""
	} catch {
		// Keep empty url
	}

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
