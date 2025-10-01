import React, { useState } from "react"
import { Box } from "ink"
import { Text } from "../../common/Text.js"
import Spinner from "ink-spinner"
import { logs } from "../../../../services/logs.js"
import type { ClineMessage } from "../../../../types/messages.js"
import { MessageHeader } from "./components/MessageHeader.js"
import { ToolDisplay } from "./components/ToolDisplay.js"
import { FollowUpDisplay } from "./components/FollowUpDisplay.js"
import { CommandDisplay } from "./components/CommandDisplay.js"
import { BrowserDisplay } from "./components/BrowserDisplay.js"
import { TodoDisplay } from "./components/TodoDisplay.js"
import {
	parseApiInfo,
	parseToolInfo,
	parseFollowUpData,
	formatCost,
	formatTokens,
	truncateText,
} from "./utils/messageFormatters.js"
import { MessageIcons, BoxChars } from "./utils/messageIcons.js"

interface ChatMessageRowProps {
	message: ClineMessage
	isLast?: boolean
	isStreaming?: boolean
	lastModifiedMessage?: ClineMessage | undefined
}

export const ChatMessageRow: React.FC<ChatMessageRowProps> = ({
	message,
	isLast = false,
	isStreaming = false,
	lastModifiedMessage,
}) => {
	const [isExpanded, setIsExpanded] = useState(false)

	logs.debug("Rendering enhanced message", "MessageRow", {
		type: message.type,
		ask: message.ask,
		say: message.say,
		partial: message.partial,
	})

	const handleToggleExpand = () => {
		setIsExpanded(!isExpanded)
	}

	const renderMessageContent = () => {
		// Handle "ask" type messages
		if (message.type === "ask") {
			switch (message.ask) {
				case "tool":
					return <ToolDisplay message={message} isExpanded={isExpanded} />

				case "command":
					const isCommandExecuting = Boolean(
						isLast &&
							lastModifiedMessage?.ask === "command" &&
							lastModifiedMessage?.text?.includes("COMMAND_OUTPUT_STRING"),
					)

					return <CommandDisplay message={message} isExpanded={isExpanded} isExecuting={isCommandExecuting} />

				case "browser_action_launch":
					const isBrowsing = isLast && isStreaming
					return <BrowserDisplay message={message} isExpanded={isExpanded} isBrowsing={isBrowsing} />

				case "followup":
					return <FollowUpDisplay message={message} isExpanded={isExpanded} />

				case "completion_result":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="green">{message.text || "Task completed successfully!"}</Text>
							</Box>
						</Box>
					)

				case "use_mcp_server":
					let mcpInfo: any = {}
					try {
						mcpInfo = JSON.parse(message.text || "{}")
					} catch {
						mcpInfo = {}
					}

					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="cyan">
									{MessageIcons.api} MCP Server: {mcpInfo.serverName || "unknown"}
								</Text>
							</Box>
							{mcpInfo.toolName && (
								<Box paddingLeft={2}>
									<Text color="gray">
										{BoxChars.vertical} Tool: {mcpInfo.toolName}
									</Text>
								</Box>
							)}
							{isExpanded && mcpInfo.arguments && (
								<Box marginTop={1} paddingLeft={2}>
									<Box borderStyle="single" borderColor="gray" paddingX={1}>
										<Text>{truncateText(mcpInfo.arguments, 200)}</Text>
									</Box>
								</Box>
							)}
						</Box>
					)

				case "mistake_limit_reached":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="red">{MessageIcons.warning} Mistake limit reached</Text>
							</Box>
							<Box marginTop={1} paddingLeft={2}>
								<Text color="red">{message.text || "Too many consecutive mistakes detected"}</Text>
							</Box>
						</Box>
					)

				case "api_req_failed":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="red">{MessageIcons.error} API Request Failed</Text>
							</Box>
							<Box marginTop={1} paddingLeft={2}>
								<Text color="red">{message.text || "API request failed"}</Text>
							</Box>
						</Box>
					)

				default:
					return (
						<Box marginTop={1}>
							<Text color="cyan">
								{MessageIcons.question} {message.text || "Question"}
							</Text>
						</Box>
					)
			}
		}

		// Handle "say" type messages
		if (message.type === "say") {
			switch (message.say) {
				case "user_feedback":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="blue">{message.text || "User message"}</Text>
							</Box>
						</Box>
					)

				case "text":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="white">{message.text || "AI response"}</Text>
							</Box>
							{message.images && message.images.length > 0 ? (
								<Box marginTop={1} paddingLeft={2}>
									<Text color="gray">🖼️ {message.images.length} image(s) attached</Text>
								</Box>
							) : null}
						</Box>
					)

				case "api_req_started":
					const apiInfo = parseApiInfo(message.text)
					const isProcessing = message.partial || !apiInfo?.cost

					return (
						<Box flexDirection="column">
							<Box marginTop={1} flexDirection="row" justifyContent="space-between">
								<Box flexDirection="row" alignItems="center">
									{isProcessing ? (
										<Box marginRight={1}>
											<Spinner type="dots" />
										</Box>
									) : (
										<Box marginRight={1}>
											<Text>{MessageIcons.api}</Text>
										</Box>
									)}
									<Text color={isProcessing ? "yellow" : "green"}>
										{isProcessing ? "Processing..." : "API Request"}
									</Text>
								</Box>

								{apiInfo?.cost ? <Text color="gray">{formatCost(apiInfo.cost)}</Text> : null}
							</Box>

							{apiInfo?.usageMissing && (
								<Box marginTop={1} paddingLeft={2}>
									<Text color="yellow">{MessageIcons.warning} Cost calculation unavailable</Text>
								</Box>
							)}

							{isExpanded && apiInfo && (
								<Box marginTop={1} paddingLeft={2}>
									<Box flexDirection="column">
										{apiInfo.tokensIn && (
											<Text color="gray">
												{BoxChars.vertical} Tokens in: {formatTokens(apiInfo.tokensIn)}
											</Text>
										)}
										{apiInfo.tokensOut && (
											<Text color="gray">
												{BoxChars.vertical} Tokens out: {formatTokens(apiInfo.tokensOut)}
											</Text>
										)}
									</Box>
								</Box>
							)}
						</Box>
					)

				case "completion_result":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="green">{message.text || "Task completed"}</Text>
							</Box>
						</Box>
					)

				case "error":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="red">{message.text || "An error occurred"}</Text>
							</Box>
						</Box>
					)

				case "checkpoint_saved":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="blue">{MessageIcons.cache} Checkpoint saved</Text>
							</Box>
							{message.text && isExpanded && (
								<Box marginTop={1} paddingLeft={2}>
									<Text color="gray">
										{BoxChars.vertical} Hash: {message.text}
									</Text>
								</Box>
							)}
						</Box>
					)

				case "reasoning":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="magenta">{MessageIcons.processing} Reasoning...</Text>
							</Box>
							{isExpanded && message.text && (
								<Box marginTop={1} paddingLeft={2}>
									<Box borderStyle="single" borderColor="magenta" paddingX={1}>
										<Text color="magenta">{truncateText(message.text, 300)}</Text>
									</Box>
								</Box>
							)}
						</Box>
					)

				case "browser_action":
					return <BrowserDisplay message={message} isExpanded={isExpanded} />

				case "browser_action_result":
					return <BrowserDisplay message={message} isExpanded={isExpanded} />

				case "command_output":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="green">{MessageIcons.terminal} Command output</Text>
							</Box>
							{message.text && (
								<Box marginTop={1} paddingLeft={2}>
									<Box borderStyle="single" borderColor="green" paddingX={1}>
										<Text color="green">
											{isExpanded ? message.text : truncateText(message.text, 200)}
										</Text>
									</Box>
								</Box>
							)}
						</Box>
					)

				case "subtask_result":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="green">{MessageIcons.success} Subtask completed</Text>
							</Box>
							{message.text && (
								<Box marginTop={1} paddingLeft={2}>
									<Box borderStyle="single" borderColor="green" paddingX={1}>
										<Text color="green">
											{isExpanded ? message.text : truncateText(message.text, 200)}
										</Text>
									</Box>
								</Box>
							)}
						</Box>
					)

				case "diff_error":
					return (
						<Box flexDirection="column">
							<Box marginTop={1}>
								<Text color="red">{MessageIcons.warning} Diff Error</Text>
							</Box>
							{message.text && isExpanded && (
								<Box marginTop={1} paddingLeft={2}>
									<Box borderStyle="single" borderColor="red" paddingX={1}>
										<Text color="red">{message.text}</Text>
									</Box>
								</Box>
							)}
						</Box>
					)

				case "user_edit_todos":
					const toolInfo = parseToolInfo(message.text)
					if (toolInfo?.todos) {
						return <TodoDisplay todos={toolInfo.todos} isExpanded={isExpanded} />
					}
					return (
						<Box marginTop={1}>
							<Text color="blue">📝 Todo list updated</Text>
						</Box>
					)

				default:
					return (
						<Box marginTop={1}>
							<Text color="white">{message.text || "System message"}</Text>
						</Box>
					)
			}
		}

		// Fallback for unknown message types
		return (
			<Box marginTop={1}>
				<Text color="gray">
					{MessageIcons.default} {message.text || "Unknown message"}
				</Text>
			</Box>
		)
	}

	// Determine if message should be expandable
	const isExpandable = () => {
		if (message.type === "ask") {
			return ["tool", "command", "browser_action_launch", "followup", "use_mcp_server"].includes(
				message.ask || "",
			)
		}
		if (message.type === "say") {
			return ["api_req_started", "reasoning", "diff_error", "command_output", "subtask_result"].includes(
				message.say || "",
			)
		}
		return false
	}

	return (
		<Box marginBottom={1} minHeight={1} flexShrink={0}>
			<Box flexDirection="column" width="100%">
				{/* Message Header */}
				<MessageHeader
					message={message}
					isExpanded={isExpanded}
					{...(isExpandable() ? { onToggleExpand: handleToggleExpand } : {})}
				/>

				{/* Message Content */}
				<Box paddingLeft={1}>{renderMessageContent()}</Box>

				{/* Streaming indicator */}
				{message.partial && (
					<Box marginTop={1} paddingLeft={1}>
						<Box flexDirection="row" alignItems="center">
							<Box marginRight={1}>
								<Spinner type="dots" />
							</Box>
							<Text color="gray" dimColor>
								Streaming...
							</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	)
}
