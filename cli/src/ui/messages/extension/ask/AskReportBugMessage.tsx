import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"

/**
 * Display bug report creation request
 */
export const AskReportBugMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "report_bug")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} Bug Report Request
				</Text>
			</Box>

			{message.text && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="white">{message.text}</Text>
				</Box>
			)}

			<Box marginLeft={2} marginTop={1}>
				<Text color="gray" dimColor>
					A GitHub issue will be created to report this bug.
				</Text>
			</Box>

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
