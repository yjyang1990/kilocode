import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import type { ClineMessage } from "../../../../../types/messages.js"
import { parseFollowUpData, truncateText } from "../utils/messageFormatters.js"
import { BoxChars } from "../utils/messageIcons.js"

interface FollowUpDisplayProps {
	message: ClineMessage
	isExpanded?: boolean
}

export const FollowUpDisplay: React.FC<FollowUpDisplayProps> = ({ message, isExpanded = false }) => {
	const followUpData = parseFollowUpData(message.text)

	if (!followUpData) {
		return (
			<Box>
				<Text color="cyan">❓ Question (parsing failed)</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column">
			{/* Question text */}
			{followUpData.question && (
				<Box marginBottom={1}>
					<Text color="cyan">{followUpData.question}</Text>
				</Box>
			)}

			{/* Suggestions */}
			{followUpData.suggest && Array.isArray(followUpData.suggest) && followUpData.suggest.length > 0 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="gray" bold>
							Suggestions:
						</Text>
					</Box>
					{followUpData.suggest.slice(0, isExpanded ? undefined : 3).map((suggestion: any, index: number) => (
						<Box key={index} marginBottom={1}>
							<Box>
								<Text color="gray">{BoxChars.teeRight} </Text>
								<Text color="white" bold>
									{index + 1}.
								</Text>
								<Text color="white"> {truncateText(suggestion.answer, 80)}</Text>
							</Box>
							{suggestion.mode && (
								<Box paddingLeft={4}>
									<Text color="magenta" dimColor>
										Mode: {suggestion.mode}
									</Text>
								</Box>
							)}
						</Box>
					))}

					{!isExpanded && followUpData.suggest.length > 3 && (
						<Box>
							<Text color="gray" dimColor>
								... and {followUpData.suggest.length - 3} more suggestions
							</Text>
						</Box>
					)}

					<Box marginTop={1}>
						<Text color="gray" dimColor>
							Press y/n to approve/reject, or Enter to type a custom response
						</Text>
					</Box>
				</Box>
			)}
		</Box>
	)
}
