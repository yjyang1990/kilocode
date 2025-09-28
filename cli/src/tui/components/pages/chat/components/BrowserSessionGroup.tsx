import React, { useState } from "react"
import { Box, Text } from "ink"
import Spinner from "ink-spinner"
import type { ClineMessage } from "../../../../../types/messages.js"
import { MessageIcons, BoxChars } from "../utils/messageIcons.js"
import { BrowserDisplay } from "./BrowserDisplay.js"
import { ChatMessageRow } from "../ChatMessageRow.js"

interface BrowserSessionGroupProps {
	messages: ClineMessage[]
	isLast?: boolean
	isStreaming?: boolean
}

export const BrowserSessionGroup: React.FC<BrowserSessionGroupProps> = ({
	messages,
	isLast = false,
	isStreaming = false,
}) => {
	const [isExpanded, setIsExpanded] = useState(false)

	if (messages.length === 0) return null

	// Find the launch message to get initial URL
	const launchMessage = messages.find((m) => m.ask === "browser_action_launch")
	const initialUrl = launchMessage?.text || "unknown"

	// Check if browser is currently active
	const isBrowsing = isLast && messages.some((m) => m.say === "browser_action_result") && isStreaming

	// Get the latest browser state
	const getLatestBrowserState = () => {
		const resultMessages = messages.filter((m) => m.say === "browser_action_result")
		if (resultMessages.length === 0) return null

		const latestResult = resultMessages[resultMessages.length - 1]
		if (!latestResult) return null

		try {
			return JSON.parse(latestResult.text || "{}")
		} catch {
			return null
		}
	}

	const browserState = getLatestBrowserState()
	const currentUrl = browserState?.currentUrl || initialUrl

	const handleToggleExpand = () => {
		setIsExpanded(!isExpanded)
	}

	return (
		<Box marginBottom={1} flexShrink={0}>
			<Box flexDirection="column" width="100%">
				{/* Browser Session Header */}
				<Box
					flexDirection="row"
					justifyContent="space-between"
					alignItems="center"
					borderStyle="single"
					borderColor="cyan"
					paddingX={1}>
					<Box flexDirection="row" alignItems="center">
						{isBrowsing ? (
							<Box marginRight={1}>
								<Spinner type="dots" />
							</Box>
						) : (
							<Box marginRight={1}>
								<Text>{MessageIcons.browser}</Text>
							</Box>
						)}
						<Text color="cyan" bold>
							{isBrowsing ? "Browser Session (Active)" : "Browser Session"}
						</Text>
						<Box marginLeft={1}>
							<Text color="gray">{isExpanded ? "▼" : "▶"}</Text>
						</Box>
					</Box>

					<Text color="gray" dimColor>
						{messages.length} actions
					</Text>
				</Box>

				{/* URL Bar */}
				<Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1}>
					<Text color="blue">
						🌐 {currentUrl.length > 60 ? currentUrl.substring(0, 57) + "..." : currentUrl}
					</Text>
				</Box>

				{/* Browser State Info */}
				{browserState && (
					<Box marginTop={1} paddingLeft={2}>
						<Box flexDirection="column">
							{browserState.screenshot && (
								<Text color="gray">{BoxChars.vertical} Screenshot captured</Text>
							)}
							{browserState.currentMousePosition && isExpanded && (
								<Text color="gray">
									{BoxChars.vertical} Mouse: {browserState.currentMousePosition}
								</Text>
							)}
							{browserState.logs && isExpanded && (
								<Box marginTop={1}>
									<Text color="gray">{BoxChars.vertical} Console logs:</Text>
									<Box marginTop={1} borderStyle="single" borderColor="yellow" paddingX={1}>
										<Text color="yellow">
											{browserState.logs.length > 200
												? browserState.logs.substring(0, 197) + "..."
												: browserState.logs}
										</Text>
									</Box>
								</Box>
							)}
						</Box>
					</Box>
				)}

				{/* Browser Actions */}
				{isExpanded && (
					<Box marginTop={1} paddingLeft={2}>
						<Box flexDirection="column">
							<Text color="gray" bold>
								Actions:
							</Text>
							{messages.map((message, index) => {
								// Only show browser-related messages in expanded view
								if (message.say === "browser_action" || message.say === "browser_action_result") {
									return (
										<Box key={`${message.ts}-${index}`} marginTop={1}>
											<BrowserDisplay message={message} isExpanded={false} />
										</Box>
									)
								}
								// Show other messages like API requests and text
								if (message.say === "api_req_started" || message.say === "text") {
									return (
										<Box key={`${message.ts}-${index}`} marginTop={1}>
											<ChatMessageRow message={message} isLast={false} isStreaming={false} />
										</Box>
									)
								}
								return null
							})}
						</Box>
					</Box>
				)}

				{/* Expand/Collapse Control */}
				<Box marginTop={1} justifyContent="center">
					<Box borderStyle="single" borderColor="gray" paddingX={1}>
						<Text color="gray" dimColor>
							{isExpanded ? "▲ Collapse" : "▼ Expand"} browser session
						</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
