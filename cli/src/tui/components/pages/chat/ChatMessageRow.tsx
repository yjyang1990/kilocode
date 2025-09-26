import React from "react"
import { Box, Text } from "ink"
import { logService } from "../../../../services/LogService.js"
import type { ClineMessage } from "../../../../types/messages.js"
import Spinner from "ink-spinner"

export const ChatMessageRow: React.FC<{ message: ClineMessage }> = ({ message }) => {
	const getMessageDisplay = () => {
		logService.debug("Rendering message", "MessageRow", { message })
		if (message.type === "say") {
			switch (message.say) {
				case "user_feedback":
					return {
						color: "blue",
						text: message.text || "User message",
						label: "You",
					}
				case "text":
					return {
						color: "white",
						text: message.text || "AI response",
					}
				case "completion_result":
					return {
						color: "green",
						text: message.text || "",
						label: "Task completed",
					}
				case "api_req_started":
					const apiInfo = message.text ? JSON.parse(message.text) : {}
					const isProcessing = message.partial || !apiInfo.cost
					return {
						color: isProcessing ? "yellow" : "green",
						text: isProcessing ? "Thinking..." : `(cost: $${apiInfo.cost || 0})`,
						label: "API Request",
					}
				case "error":
					return {
						color: "red",
						text: message.text || "An error occurred",
						label: "Error",
					}
				case "checkpoint_saved":
					return {
						color: "blue",
						text: message.text || "-",
						label: "Checkpoint",
					}
				default:
					return {
						color: "white",
						text: message.text || "Processing...",
						label: "System",
					}
			}
		} else if (message.type === "ask") {
			switch (message.ask) {
				case "followup":
					return {
						color: "cyan",
						text: message.text || "Question",
						label: "Question",
					}
				case "tool":
				case "command":
				case "browser_action_launch":
					return {
						color: "yellow",
						text: message.text || "Action required",
						label: "Action",
					}
				case "completion_result":
					return {
						color: "green",
						text: message.text || "Task completed",
						label: "Completed",
					}
				default:
					return {
						color: "cyan",
						text: message.text || "Question",
						label: "Question",
					}
			}
		}

		return {
			color: "white",
			text: message.text || "No content",
			label: "Unknown",
		}
	}

	const { color, text, label } = getMessageDisplay()

	return (
		<Box marginBottom={1}>
			<Box flexDirection="column" flexGrow={1} flexShrink={0}>
				<Box marginBottom={0}>
					<Text color={color} bold>
						{label}
					</Text>
				</Box>
				<Text color={color}>{text}</Text>
				{message.partial && (
					<Box marginTop={0}>
						<Text color="gray" dimColor>
							<Spinner type="dots" /> Streaming...
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
