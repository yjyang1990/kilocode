import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"
import { MarkdownText } from "../../../components/MarkdownText.js"

/**
 * Display low credit warning with payment icon
 */
export const AskPaymentRequiredMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "payment_required_prompt")

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1} marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Low Credit Warning
				</Text>
			</Box>

			{message.text && (
				<Box marginTop={1}>
					<MarkdownText>{message.text}</MarkdownText>
				</Box>
			)}

			<Box marginTop={1}>
				<Text color="gray" dimColor>
					Your account is running low on credits. Please add more credits to continue.
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
