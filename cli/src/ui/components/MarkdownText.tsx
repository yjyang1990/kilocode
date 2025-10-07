import React from "react"
import Markdown from "@jescalan/ink-markdown"
import { Text } from "ink"

interface MarkdownTextProps {
	children: string
}

/**
 * Wrapper component for rendering markdown text in Ink
 * Falls back to plain Text if markdown parsing fails
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ children }) => {
	// If the text is empty or just whitespace, don't render anything
	if (!children || !children.trim()) {
		return null
	}

	try {
		// Render markdown - the library handles its own styling
		return <Markdown>{children}</Markdown>
	} catch (error) {
		// Fallback to plain text if markdown parsing fails
		return <Text>{children}</Text>
	}
}
