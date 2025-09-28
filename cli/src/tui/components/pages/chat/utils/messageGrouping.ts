import type { ClineMessage } from "../../../../../types/messages.js"

export interface MessageGroup {
	type: "single" | "browser_session"
	messages: ClineMessage[]
	id: string
}

// Check if message is part of a browser session
export const isBrowserSessionMessage = (message: ClineMessage): boolean => {
	if (message.type === "ask") {
		return message.ask === "browser_action_launch"
	}

	if (message.type === "say") {
		return ["api_req_started", "text", "browser_action", "browser_action_result"].includes(message.say || "")
	}

	return false
}

// Group messages similar to the web version
export const groupMessages = (messages: ClineMessage[]): MessageGroup[] => {
	const result: MessageGroup[] = []
	let currentGroup: ClineMessage[] = []
	let isInBrowserSession = false
	let groupCounter = 0

	const endBrowserSession = () => {
		if (currentGroup.length > 0) {
			result.push({
				type: "browser_session",
				messages: [...currentGroup],
				id: `browser-session-${groupCounter++}`,
			})
			currentGroup = []
			isInBrowserSession = false
		}
	}

	messages.forEach((message) => {
		// Special handling for browser_action_result - ensure it's always in a browser session
		if (message.say === "browser_action_result" && !isInBrowserSession) {
			isInBrowserSession = true
			currentGroup = []
		}

		// Special handling for browser_action - ensure it's always in a browser session
		if (message.say === "browser_action" && !isInBrowserSession) {
			isInBrowserSession = true
			currentGroup = []
		}

		if (message.ask === "browser_action_launch") {
			// Complete existing browser session if any
			endBrowserSession()
			// Start new session
			isInBrowserSession = true
			currentGroup.push(message)
		} else if (isInBrowserSession) {
			// End session if api_req_started is cancelled
			if (message.say === "api_req_started") {
				// Get last api_req_started in currentGroup to check if it's cancelled
				const lastApiReqStarted = [...currentGroup].reverse().find((m) => m.say === "api_req_started")

				if (lastApiReqStarted?.text) {
					try {
						const info = JSON.parse(lastApiReqStarted.text)
						const isCancelled = info.cancelReason !== null && info.cancelReason !== undefined

						if (isCancelled) {
							endBrowserSession()
							result.push({
								type: "single",
								messages: [message],
								id: `single-${groupCounter++}`,
							})
							return
						}
					} catch {
						// If parsing fails, continue with grouping
					}
				}
			}

			if (isBrowserSessionMessage(message)) {
				currentGroup.push(message)

				// Check if browser session should end (close action)
				if (message.say === "browser_action_result") {
					const lastBrowserAction = [...currentGroup].reverse().find((m) => m.say === "browser_action")
					if (lastBrowserAction) {
						try {
							const browserAction = JSON.parse(lastBrowserAction.text || "{}")
							if (browserAction.action === "close") {
								endBrowserSession()
							}
						} catch {
							// If parsing fails, continue
						}
					}
				}
			} else {
				// Complete existing browser session if any
				endBrowserSession()
				result.push({
					type: "single",
					messages: [message],
					id: `single-${groupCounter++}`,
				})
			}
		} else {
			result.push({
				type: "single",
				messages: [message],
				id: `single-${groupCounter++}`,
			})
		}
	})

	// Handle case where browser session is the last group
	if (currentGroup.length > 0) {
		result.push({
			type: "browser_session",
			messages: [...currentGroup],
			id: `browser-session-${groupCounter++}`,
		})
	}

	return result
}

// Get API metrics from messages (similar to web version)
export const getApiMetrics = (messages: ClineMessage[]) => {
	let totalTokensIn = 0
	let totalTokensOut = 0
	let totalCost = 0
	let totalCacheWrites = 0
	let totalCacheReads = 0

	messages.forEach((message) => {
		if (message.say === "api_req_started" && message.text) {
			try {
				const info = JSON.parse(message.text)
				if (info.cost) totalCost += info.cost
				if (info.tokensIn) totalTokensIn += info.tokensIn
				if (info.tokensOut) totalTokensOut += info.tokensOut
				if (info.cacheWrites) totalCacheWrites += info.cacheWrites
				if (info.cacheReads) totalCacheReads += info.cacheReads
			} catch {
				// Ignore parsing errors
			}
		}
	})

	return {
		totalTokensIn,
		totalTokensOut,
		totalCost,
		totalCacheWrites,
		totalCacheReads,
		contextTokens: 0, // This would need to be calculated differently
	}
}

// Extract latest todos from messages
export const getLatestTodos = (messages: ClineMessage[]): any[] => {
	// Look for the most recent updateTodoList tool usage
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i]
		if (message && message.ask === "tool" && message.text) {
			try {
				const tool = JSON.parse(message.text)
				if (tool.tool === "updateTodoList" && tool.todos) {
					return tool.todos
				}
			} catch {
				// Ignore parsing errors
			}
		}
	}
	return []
}
