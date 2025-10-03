import React from "react"
import { Box, Text } from "ink"
import type { ExtensionChatMessage } from "../../../types/messages.js"
import { logs } from "../../../services/logs.js"
import { ErrorBoundary } from "react-error-boundary"

interface ExtensionMessageRowProps {
	message: ExtensionChatMessage
}

interface ReadFileToolProps {
	files: Array<{ path: string }>
}

const ReadFileToolMessage: React.FC<ReadFileToolProps> = ({ files }) => {
	if (!files || files.length === 0) {
		return null
	}

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
			<Box>
				<Text color="white" bold>
					ReadFile
				</Text>
			</Box>
			<Box flexDirection="column" marginTop={1}>
				{files.map((file, index) => (
					<Text key={index} color="gray">
						- {file.path}
					</Text>
				))}
			</Box>
		</Box>
	)
}

const DefaultMessage: React.FC<{ message: ExtensionChatMessage }> = ({ message }) => {
	const getColor = () => {
		switch (message.type) {
			case "ask":
				return "yellow"
			case "say":
				return "green"
			default:
				return "white"
		}
	}

	const getPrefix = () => {
		switch (message.type) {
			case "ask":
				return "?"
			case "say":
				return ">"
			default:
				return " "
		}
	}

	// Get the display text based on message type
	const getDisplayText = () => {
		// Always prefer message.text as it contains the actual content
		// message.ask and message.say often contain just the subtype (e.g., "text", "completion_result")
		if (message.text) {
			return message.text
		}
		if (message.type === "ask" && message.ask && message.ask !== "text") {
			return message.ask
		}
		if (message.type === "say" && message.say && message.say !== "text") {
			return message.say
		}
		return ""
	}

	const displayText = getDisplayText()

	// Don't render if there's no text
	if (!displayText) {
		return null
	}

	if (message.type === "say" && message.say === "api_req_started") {
		return null
	}

	const color = getColor()
	const prefix = getPrefix()

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box>
				<Text color={color as any} bold>
					{prefix}{" "}
				</Text>
				<Text color="white">{displayText}</Text>
				{message.partial && (
					<Text color="gray" dimColor>
						{" "}
						...
					</Text>
				)}
			</Box>
			{message.isAnswered && message.type === "ask" && (
				<Box marginLeft={2}>
					<Text color="gray" dimColor>
						✓ Answered
					</Text>
				</Box>
			)}
		</Box>
	)
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

	let messageIsJson = false
	let messageJson = null
	try {
		messageJson = JSON.parse(message.text || "")
		messageIsJson = true
	} catch {}

	if (messageJson?.batchFiles) {
		logs.info(
			"Rendering",
			"ExtensionMessageRow",
			messageJson.batchFiles.map((f: { path: string }) => f.path),
		)
	}

	return (
		<ErrorBoundary fallbackRender={renderError}>
			{(() => {
				if (messageJson?.tool === "readFile") {
					return <ReadFileToolMessage files={messageJson.batchFiles} />
				} else {
					return <DefaultMessage message={message} />
				}
			})()}
		</ErrorBoundary>
	)
}
