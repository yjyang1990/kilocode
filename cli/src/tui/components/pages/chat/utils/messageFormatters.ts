import type { ClineMessage } from "../../../../../types/messages.js"

// Format timestamp for display
export const formatTimestamp = (ts: number): string => {
	const date = new Date(ts)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / (1000 * 60))
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

	if (diffMins < 1) return "now"
	if (diffMins < 60) return `${diffMins}m ago`
	if (diffHours < 24) return `${diffHours}h ago`

	return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Format cost for display
export const formatCost = (cost: number): string => {
	if (cost === 0) return "Free"
	if (cost < 0.001) return "<$0.001"
	return `$${cost.toFixed(3)}`
}

// Format token count for display
export const formatTokens = (tokens: number): string => {
	if (tokens < 1000) return tokens.toString()
	if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`
	return `${(tokens / 1000000).toFixed(1)}M`
}

// Parse tool information from message text
export const parseToolInfo = (text: string | undefined): any => {
	if (!text) return null
	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}

// Parse API request information
export const parseApiInfo = (text: string | undefined): any => {
	if (!text) return null
	try {
		const info = JSON.parse(text)
		return {
			cost: info.cost,
			tokensIn: info.tokensIn,
			tokensOut: info.tokensOut,
			cancelReason: info.cancelReason,
			streamingFailedMessage: info.streamingFailedMessage,
			usageMissing: info.usageMissing,
		}
	} catch {
		return null
	}
}

// Truncate text for display
export const truncateText = (text: string, maxLength: number = 100): string => {
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength - 3) + "..."
}

// Format file path for display
export const formatFilePath = (path: string): string => {
	// Remove leading ./ and show relative path
	return path.replace(/^\.\//, "")
}

// Extract command from command text
export const extractCommand = (text: string): string => {
	try {
		const parsed = JSON.parse(text)
		return parsed.command || text
	} catch {
		return text
	}
}

// Format follow-up data
export const parseFollowUpData = (text: string | undefined): any => {
	if (!text) return null
	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}

// Check if message is a browser action
export const isBrowserAction = (message: ClineMessage): boolean => {
	return (
		message.ask === "browser_action_launch" ||
		message.say === "browser_action" ||
		message.say === "browser_action_result"
	)
}

// Check if message should be grouped
export const shouldGroupMessage = (message: ClineMessage, previousMessage?: ClineMessage): boolean => {
	if (!previousMessage) return false

	// Group browser actions together
	if (isBrowserAction(message) && isBrowserAction(previousMessage)) {
		return true
	}

	// Group API requests with their responses
	if (message.say === "api_req_started" && previousMessage.say === "text") {
		return true
	}

	return false
}

// Get message priority for sorting/display
export const getMessagePriority = (message: ClineMessage): number => {
	if (message.type === "ask") {
		switch (message.ask) {
			case "tool":
			case "command":
			case "browser_action_launch":
				return 1 // High priority - requires user action
			case "followup":
				return 2 // Medium priority - question
			default:
				return 3
		}
	}

	if (message.type === "say") {
		switch (message.say) {
			case "error":
				return 1 // High priority - error
			case "completion_result":
				return 2 // Medium priority - completion
			default:
				return 4 // Low priority - regular message
		}
	}

	return 5 // Lowest priority
}
