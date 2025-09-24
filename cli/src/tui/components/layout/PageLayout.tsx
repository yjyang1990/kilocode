import React from "react"
import { Box } from "ink"
import type { PageLayoutProps } from "../../types/components.js"

/**
 * Base page layout component that provides consistent structure
 * for all page components in the TUI
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
	header,
	footer,
	children,
	sidebarVisible = false,
	scrollable = false,
}) => {
	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			{header && header}

			{/* Main content area */}
			<Box flexDirection="column" flexGrow={1}>
				{children}
			</Box>

			{/* Footer */}
			{footer && footer}
		</Box>
	)
}
