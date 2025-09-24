import React from "react"
import { Box } from "ink"

interface SectionProps {
	children: React.ReactNode
	paddingX?: number
	paddingY?: number
}

export const Section: React.FC<SectionProps> = ({ children, paddingX = 2, paddingY = 1 }) => {
	return (
		<Box flexDirection="column" paddingX={paddingX} paddingY={paddingY}>
			{children}
		</Box>
	)
}
