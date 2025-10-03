import React from "react"
import { Box, Text } from "ink"
import type { ExtensionChatMessage } from "../../../types/messages.js"
import { logs } from "../../../services/logs.js"
import { ErrorBoundary } from "react-error-boundary"
import { AskMessageRouter } from "./AskMessageRouter.js"
import { SayMessageRouter } from "./SayMessageRouter.js"

interface ExtensionMessageRowProps {
	message: ExtensionChatMessage
}

function renderError({ error }: { error: Error }) {
	return (
		<Box borderColor="red" borderStyle="single" padding={1} marginY={1}>
			<Text color="red">Error rendering message: {error.message}</Text>
		</Box>
	)
}

export const ExtensionMessageRow: React.FC<ExtensionMessageRowProps> = ({ message }) => {
	logs.debug("Rendering ExtensionMessageRow", "ExtensionMessageRow", { message })

	return (
		<ErrorBoundary fallbackRender={renderError}>
			{message.type === "ask" ? (
				<AskMessageRouter message={message} />
			) : message.type === "say" ? (
				<SayMessageRouter message={message} />
			) : (
				<Box>
					<Text color="gray" dimColor>
						Unknown message type: {message.type}
					</Text>
				</Box>
			)}
		</ErrorBoundary>
	)
}
