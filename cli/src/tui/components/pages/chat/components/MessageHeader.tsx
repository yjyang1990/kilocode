import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import Spinner from "ink-spinner"
import type { ClineMessage } from "../../../../../types/messages.js"
import { MessageIcons } from "../utils/messageIcons.js"
import { formatTimestamp, formatCost, parseApiInfo } from "../utils/messageFormatters.js"

interface MessageHeaderProps {
	message: ClineMessage
	isExpanded?: boolean
	onToggleExpand?: (() => void) | undefined
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({ message, isExpanded = false, onToggleExpand }) => {
	const getHeaderInfo = () => {
		const type = message.type === "ask" ? message.ask : message.say

		switch (type) {
			case "user_feedback":
				return {
					icon: MessageIcons.user,
					label: "You",
					color: "blue",
					showTimestamp: true,
				}

			case "text":
				return {
					icon: MessageIcons.assistant,
					label: "Assistant",
					color: "white",
					showTimestamp: true,
				}

			case "api_req_started":
				const apiInfo = parseApiInfo(message.text)
				const isProcessing = message.partial || !apiInfo?.cost
				return {
					icon: isProcessing ? MessageIcons.loading : MessageIcons.api,
					label: isProcessing ? "Thinking..." : "API Request",
					color: isProcessing ? "yellow" : "green",
					showTimestamp: true,
					metadata: apiInfo?.cost ? formatCost(apiInfo.cost) : undefined,
				}

			case "tool":
				return {
					icon: MessageIcons.edit,
					label: "Tool Request",
					color: "yellow",
					showTimestamp: true,
					expandable: true,
				}

			case "command":
				return {
					icon: MessageIcons.terminal,
					label: "Command",
					color: "yellow",
					showTimestamp: true,
					expandable: true,
				}

			case "browser_action_launch":
				return {
					icon: MessageIcons.browser,
					label: "Browser Action",
					color: "cyan",
					showTimestamp: true,
					expandable: true,
				}

			case "followup":
				return {
					icon: MessageIcons.question,
					label: "Question",
					color: "cyan",
					showTimestamp: true,
				}

			case "completion_result":
				return {
					icon: MessageIcons.completed,
					label: "Task Completed",
					color: "green",
					showTimestamp: true,
				}

			case "error":
				return {
					icon: MessageIcons.error,
					label: "Error",
					color: "red",
					showTimestamp: true,
				}

			case "checkpoint_saved":
				return {
					icon: MessageIcons.cache,
					label: "Checkpoint",
					color: "blue",
					showTimestamp: true,
				}

			case "reasoning":
				return {
					icon: MessageIcons.processing,
					label: "Reasoning",
					color: "magenta",
					showTimestamp: true,
					expandable: true,
				}

			case "diff_error":
				return {
					icon: MessageIcons.warning,
					label: "Diff Error",
					color: "red",
					showTimestamp: true,
					expandable: true,
				}

			case "subtask_result":
				return {
					icon: MessageIcons.success,
					label: "Subtask Result",
					color: "green",
					showTimestamp: true,
				}

			case "use_mcp_server":
				return {
					icon: MessageIcons.api,
					label: "MCP Server",
					color: "cyan",
					showTimestamp: true,
					expandable: true,
				}

			default:
				return {
					icon: MessageIcons.default,
					label: "System",
					color: "gray",
					showTimestamp: true,
				}
		}
	}

	const headerInfo = getHeaderInfo()

	return (
		<Box flexDirection="row" justifyContent="space-between" alignItems="center">
			<Box flexDirection="row" alignItems="center">
				{/* Icon and spinner for processing states */}
				{message.partial && headerInfo.icon === MessageIcons.loading ? (
					<Box marginRight={1}>
						<Spinner type="dots" />
					</Box>
				) : (
					<Box marginRight={1}>
						<Text>{headerInfo.icon}</Text>
					</Box>
				)}

				{/* Label */}
				<Text color={headerInfo.color} bold>
					{headerInfo.label}
				</Text>

				{/* Metadata (cost, tokens, etc.) */}
				{headerInfo.metadata && (
					<Box marginLeft={1}>
						<Text color="gray">({headerInfo.metadata})</Text>
					</Box>
				)}

				{/* Expandable indicator */}
				{headerInfo.expandable && onToggleExpand && (
					<Box marginLeft={1}>
						<Text color="gray">{isExpanded ? "▼" : "▶"}</Text>
					</Box>
				)}
			</Box>

			{/* Timestamp */}
			{headerInfo.showTimestamp && (
				<Text color="gray" dimColor>
					{formatTimestamp(message.ts)}
				</Text>
			)}
		</Box>
	)
}
