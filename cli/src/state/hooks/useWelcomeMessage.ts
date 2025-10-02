/**
 * Hook for displaying the welcome message
 * Encapsulates the initialization logic for the CLI welcome message
 */

import { useEffect } from "react"
import { useSetAtom } from "jotai"
import { addMessageAtom } from "../atoms/ui.js"
import type { CliMessage } from "../../types/cli.js"

/**
 * Configuration for the welcome message
 */
export interface WelcomeMessageConfig {
	/** Whether to show the welcome message */
	enabled?: boolean
	/** Custom welcome message content */
	customContent?: string[]
}

/**
 * Default welcome message content
 */
const DEFAULT_WELCOME_CONTENT = [
	"Welcome to Kilo Code CLI!",
	"",
	"Type a message to start chatting, or use /help to see available commands.",
	"Commands start with / (e.g., /help, /mode, /clear)",
]

/**
 * Hook that displays a welcome message when the component mounts
 *
 * This hook encapsulates the logic for showing the initial welcome message,
 * making it reusable and keeping the main UI component clean.
 *
 * @param config - Optional configuration for the welcome message
 *
 * @example
 * ```tsx
 * function App() {
 *   // Show default welcome message
 *   useWelcomeMessage()
 *
 *   // Or with custom content
 *   useWelcomeMessage({
 *     customContent: ["Welcome!", "Custom message here"]
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useWelcomeMessage(config?: WelcomeMessageConfig): void {
	const addMessage = useSetAtom(addMessageAtom)
	const enabled = config?.enabled ?? true
	const content = config?.customContent ?? DEFAULT_WELCOME_CONTENT

	useEffect(() => {
		if (!enabled) return

		const welcomeMessage: CliMessage = {
			id: "welcome",
			type: "system",
			content: content.join("\n"),
			ts: Date.now(),
		}

		addMessage(welcomeMessage)
	}, [addMessage, enabled]) // Content is intentionally not included to prevent re-runs
}

/**
 * Get the default welcome message content
 * Useful for testing or displaying elsewhere
 */
export function getDefaultWelcomeContent(): string[] {
	return [...DEFAULT_WELCOME_CONTENT]
}
