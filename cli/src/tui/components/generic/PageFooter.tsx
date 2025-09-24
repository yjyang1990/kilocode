import React from "react"
import { Box, Text } from "ink"
import type { PageFooterProps } from "../../types/components.js"

/**
 * Reusable page footer component that displays action hints
 * consistently across all page components in the TUI
 */
export const PageFooter: React.FC<PageFooterProps> = ({ actions, borderColor = "gray" }) => {
	return (
		<Box borderStyle="single" borderColor={borderColor} paddingX={1} flexShrink={0}>
			<Box gap={1}>
				{actions.map((action, index) => (
					<React.Fragment key={action.key}>
						{index > 0 && <Text color="gray">, </Text>}
						<Text color={action.color || "blue"}>{action.key}</Text>
						<Text color="gray"> {action.label}</Text>
						{action.description && (
							<Text color="gray" dimColor>
								{" "}
								- {action.description}
							</Text>
						)}
					</React.Fragment>
				))}
			</Box>
		</Box>
	)
}
