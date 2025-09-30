import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import Spinner from "ink-spinner"
import type { ClineMessage } from "../../../../../types/messages.js"
import { MessageIcons, BoxChars } from "../utils/messageIcons.js"
import { truncateText } from "../utils/messageFormatters.js"

interface BrowserDisplayProps {
	message: ClineMessage
	isExpanded?: boolean
	isBrowsing?: boolean
}

export const BrowserDisplay: React.FC<BrowserDisplayProps> = ({ message, isExpanded = false, isBrowsing = false }) => {
	const renderBrowserAction = () => {
		if (message.ask === "browser_action_launch") {
			return (
				<Box flexDirection="column">
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
							{isBrowsing ? "Browsing..." : "Launch browser"}
						</Text>
					</Box>

					<Box marginTop={1} paddingLeft={2}>
						<Box borderStyle="single" borderColor="cyan" paddingX={1}>
							<Text color="white">
								🌐 {isExpanded ? message.text : truncateText(message.text || "", 60)}
							</Text>
						</Box>
					</Box>
				</Box>
			)
		}

		if (message.say === "browser_action") {
			let actionInfo: any = {}
			try {
				actionInfo = JSON.parse(message.text || "{}")
			} catch {
				actionInfo = { action: "unknown" }
			}

			const getActionText = () => {
				switch (actionInfo.action) {
					case "click":
						return `Click at ${actionInfo.coordinate || "unknown"}`
					case "type":
						return `Type: "${truncateText(actionInfo.text || "", 40)}"`
					case "scroll_down":
						return "Scroll down"
					case "scroll_up":
						return "Scroll up"
					case "close":
						return "Close browser"
					default:
						return `Action: ${actionInfo.action}`
				}
			}

			return (
				<Box marginTop={1} paddingLeft={2}>
					<Box borderStyle="single" borderColor="blue" paddingX={1}>
						<Text color="blue">🎯 {getActionText()}</Text>
					</Box>
				</Box>
			)
		}

		if (message.say === "browser_action_result") {
			let resultInfo: any = {}
			try {
				resultInfo = JSON.parse(message.text || "{}")
			} catch {
				resultInfo = {}
			}

			return (
				<Box marginTop={1} paddingLeft={2}>
					<Box flexDirection="column">
						{resultInfo.currentUrl && (
							<Box>
								<Text color="gray">
									{BoxChars.vertical} URL: {truncateText(resultInfo.currentUrl, 60)}
								</Text>
							</Box>
						)}

						{resultInfo.screenshot && (
							<Box>
								<Text color="gray">{BoxChars.vertical} Screenshot captured</Text>
							</Box>
						)}

						{resultInfo.logs && isExpanded && (
							<Box marginTop={1}>
								<Text color="gray">{BoxChars.vertical} Console logs:</Text>
								<Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
									<Text color="yellow">{truncateText(resultInfo.logs, 300)}</Text>
								</Box>
							</Box>
						)}

						{resultInfo.currentMousePosition && isExpanded && (
							<Box>
								<Text color="gray">
									{BoxChars.vertical} Mouse: {resultInfo.currentMousePosition}
								</Text>
							</Box>
						)}
					</Box>
				</Box>
			)
		}

		return null
	}

	return <Box flexDirection="column">{renderBrowserAction()}</Box>
}
