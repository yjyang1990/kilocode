import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "./types.js"
import { parseToolData } from "./utils.js"
import { ToolRouter } from "./tools/ToolRouter.js"
import {
	AskToolMessage,
	AskMistakeLimitMessage,
	AskCommandMessage,
	AskUseMcpServerMessage,
	AskCompletionResultMessage,
	AskFollowupMessage,
	AskCondenseMessage,
	AskPaymentRequiredMessage,
	AskInvalidModelMessage,
	AskReportBugMessage,
	AskAutoApprovalMaxReachedMessage,
} from "./ask/index.js"

/**
 * Default component for unknown ask message types
 */
const DefaultAskMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box marginY={1}>
			<Text color="yellow">{message.text || `Unknown ask type: ${message.ask}`}</Text>
		</Box>
	)
}

/**
 * Routes ask messages to appropriate components based on message.ask value
 */
export const AskMessageRouter: React.FC<MessageComponentProps> = ({ message }) => {
	switch (message.ask) {
		case "tool": {
			const toolData = parseToolData(message)
			if (toolData) {
				return <ToolRouter message={message} toolData={toolData} />
			}
			return <AskToolMessage message={message} />
		}

		case "mistake_limit_reached":
			return <AskMistakeLimitMessage message={message} />

		case "command":
			return <AskCommandMessage message={message} />

		case "use_mcp_server":
			return <AskUseMcpServerMessage message={message} />

		case "completion_result":
			return <AskCompletionResultMessage message={message} />

		case "followup":
			return <AskFollowupMessage message={message} />

		case "condense":
			return <AskCondenseMessage message={message} />

		case "payment_required_prompt":
			return <AskPaymentRequiredMessage message={message} />

		case "invalid_model":
			return <AskInvalidModelMessage message={message} />

		case "report_bug":
			return <AskReportBugMessage message={message} />

		case "auto_approval_max_req_reached":
			return <AskAutoApprovalMaxReachedMessage message={message} />

		default:
			return <DefaultAskMessage message={message} />
	}
}
