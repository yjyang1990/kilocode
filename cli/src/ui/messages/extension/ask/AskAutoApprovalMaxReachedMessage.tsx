import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"
import { MarkdownText } from "../../../components/MarkdownText.js"

/**
 * Display auto-approval limit reached warning
 */
export const AskAutoApprovalMaxReachedMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "auto_approval_max_req_reached")

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1} marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Auto-Approval Limit Reached
				</Text>
			</Box>

			{message.text && (
				<Box marginTop={1}>
					<MarkdownText>{message.text}</MarkdownText>
				</Box>
			)}

			<Box marginTop={1}>
				<Text color="gray" dimColor>
					The maximum number of auto-approved requests has been reached. Manual approval is now required.
				</Text>
			</Box>

			{message.isAnswered && (
				<Box marginTop={1}>
					<Text color="gray" dimColor>
						✓ Answered
					</Text>
				</Box>
			)}
		</Box>
	)
}
