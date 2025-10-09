import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { parseApiReqInfo } from "../utils.js"

/**
 * Display API request status (streaming/completed/failed/cancelled)
 */
export const SayApiReqStartedMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const apiInfo = parseApiReqInfo(message)

	// Streaming state
	if (message.partial) {
		return (
			<Box marginY={1}>
				<Text color="cyan">⟳ API Request in progress...</Text>
			</Box>
		)
	}

	// Failed state
	if (apiInfo?.streamingFailedMessage) {
		return (
			<Box flexDirection="column" marginY={1}>
				<Box>
					<Text color="red" bold>
						✖ API Request failed
					</Text>
				</Box>
				<Box marginLeft={2} marginTop={1}>
					<Text color="red">{apiInfo.streamingFailedMessage}</Text>
				</Box>
			</Box>
		)
	}

	// Cancelled state
	if (apiInfo?.cancelReason) {
		return (
			<Box flexDirection="column" marginY={1}>
				<Box>
					<Text color="yellow" bold>
						⚠ API Request cancelled
					</Text>
				</Box>
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						Reason: {apiInfo.cancelReason === "user_cancelled" ? "User cancelled" : apiInfo.cancelReason}
					</Text>
				</Box>
			</Box>
		)
	}

	// Completed state
	return (
		<Box marginY={1}>
			<Text color="green" bold>
				✓ API Request
			</Text>
			{apiInfo?.cost !== undefined && (
				<>
					<Text color="cyan"> - Cost: ${apiInfo.cost.toFixed(4)}</Text>
					{apiInfo.usageMissing && (
						<Text color="gray" dimColor>
							{" "}
							(estimated)
						</Text>
					)}
				</>
			)}
		</Box>
	)
}
