import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

/**
 * Display shell integration warnings
 */
export const SayShellIntegrationWarningMessage: React.FC<MessageComponentProps> = ({ message }) => {
	return (
		<Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1} marginY={1}>
			<Box>
				<Text color="yellow" bold>
					⚠ Shell Integration Warning
				</Text>
			</Box>
			{message.text && (
				<Box marginTop={1}>
					<Text color="yellow">{message.text}</Text>
				</Box>
			)}
			<Box marginTop={1}>
				<Text color="gray" dimColor>
					Shell integration may be required for proper command execution.
				</Text>
			</Box>
		</Box>
	)
}
