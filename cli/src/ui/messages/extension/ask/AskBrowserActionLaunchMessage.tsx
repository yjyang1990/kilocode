import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"
import { useApprovalEffect } from "../../../../state/hooks/useApprovalEffect.js"

/**
 * Display browser action launch request
 */
export const AskBrowserActionLaunchMessage: React.FC<MessageComponentProps> = ({ message }) => {
	// Use centralized approval orchestration
	useApprovalEffect(message)

	const icon = getMessageIcon("ask", "browser_action_launch")

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
