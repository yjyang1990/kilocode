import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon, parseFollowUpData } from "../utils.js"

/**
 * Display follow-up question with numbered suggestions
 */
export const AskFollowupMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("ask", "followup")
	const data = parseFollowUpData(message)

	if (!data) {
		return (
			<Box marginY={1}>
				<Text color="yellow" bold>
					{icon} {message.text || "Follow-up question"}
				</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="yellow" bold>
					{icon} {data.question}
				</Text>
			</Box>

			{data.suggest && data.suggest.length > 0 && (
				<Box flexDirection="column" marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						Suggestions:
					</Text>
					{data.suggest.map((suggestion, index) => (
						<Box key={index} marginLeft={1} marginTop={index > 0 ? 0 : 1}>
							<Text color="cyan">
								{index + 1}. {suggestion.answer}
							</Text>
							{suggestion.mode && (
								<Text color="gray" dimColor>
									{" "}
									(switch to {suggestion.mode})
								</Text>
							)}
						</Box>
					))}
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
