import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"
import { getMessageIcon } from "../utils.js"

/**
 * Display checkpoint saved notifications
 */
export const SayCheckpointSavedMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("say", "checkpoint_saved")

	return (
		<Box flexDirection="column" marginY={1}>
			<Box>
				<Text color="cyan" bold>
					{icon} Checkpoint Saved
				</Text>
			</Box>

			{message.text && (
				<Box marginLeft={2} marginTop={1}>
					<Text color="gray" dimColor>
						{message.text}
					</Text>
				</Box>
			)}
		</Box>
	)
}
