import React from "react"
import { Box, Text } from "ink"
import type { PageHeaderProps } from "../../types/components.js"

/**
 * Reusable page header component that provides consistent styling
 * across all page components in the TUI
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
	title,
	subtitle,
	icon,
	color = "blue",
	badge,
	actions,
	borderColor = "blue",
}) => {
	return (
		<Box borderStyle="single" borderColor={borderColor} paddingX={1} flexShrink={0}>
			<Box justifyContent="space-between" width="100%">
				<Box>
					<Text color={color} bold>
						{icon && `${icon} `}
						{title}
						{subtitle && (
							<>
								<Text color="gray"> - </Text>
								<Text color={color}>{subtitle}</Text>
							</>
						)}
						{badge && (
							<>
								<Text color="gray"> (</Text>
								<Text color={color}>{badge}</Text>
								<Text color="gray">)</Text>
							</>
						)}
					</Text>
				</Box>
				{actions && <Box>{actions}</Box>}
			</Box>
		</Box>
	)
}
