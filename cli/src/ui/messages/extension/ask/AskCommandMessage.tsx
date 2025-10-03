import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useSetAtom } from "jotai"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon, parseToolData } from "../utils.js"
import { setPendingApprovalAtom } from "../../../../state/atoms/approval.js"

/**
 * Display command execution request with terminal icon and command in a bordered box
 */
export const AskCommandMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const icon = getMessageIcon("ask", "command")
	const toolData = parseToolData(message)

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
