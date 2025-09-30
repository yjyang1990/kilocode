import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import Spinner from "ink-spinner"
import type { ClineMessage } from "../../../../../types/messages.js"
import { extractCommand, truncateText } from "../utils/messageFormatters.js"
import { MessageIcons, BoxChars } from "../utils/messageIcons.js"

interface CommandDisplayProps {
	message: ClineMessage
	isExpanded?: boolean
	isExecuting?: boolean
}

export const CommandDisplay: React.FC<CommandDisplayProps> = ({ message, isExpanded = false, isExecuting = false }) => {
	const command = extractCommand(message.text || "")

	return (
		<Box flexDirection="column">
			<Box flexDirection="row" alignItems="center">
				{isExecuting ? (
					<Box marginRight={1}>
						<Spinner type="dots" />
					</Box>
				) : (
					<Box marginRight={1}>
						<Text>{MessageIcons.terminal}</Text>
					</Box>
				)}

				<Text color="yellow" bold>
					{isExecuting ? "Executing command:" : "Run command:"}
				</Text>
			</Box>

			{/* Command preview */}
			<Box marginTop={1} paddingLeft={2}>
				<Box borderStyle="single" borderColor="gray" paddingX={1}>
					<Text color="white">$ {isExpanded ? command : truncateText(command, 80)}</Text>
				</Box>
			</Box>

			{/* Command output if available */}
			{message.say === "command_output" && message.text && (
				<Box marginTop={1} paddingLeft={2}>
					<Box>
						<Text color="gray">{BoxChars.vertical} Output:</Text>
					</Box>
					<Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
						<Text color="green">{isExpanded ? message.text : truncateText(message.text, 200)}</Text>
					</Box>
				</Box>
			)}

			{/* Execution status */}
			{isExecuting && (
				<Box marginTop={1} paddingLeft={2}>
					<Text color="yellow" dimColor>
						Press y to continue, n to cancel
					</Text>
				</Box>
			)}
		</Box>
	)
}
