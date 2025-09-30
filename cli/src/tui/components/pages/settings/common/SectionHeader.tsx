import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"

interface SectionHeaderProps {
	title: string
	description?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
	return (
		<Box flexDirection="column" paddingX={2} paddingY={1}>
			<Box flexDirection="row" alignItems="center" gap={1}>
				<Text color="blue" bold>
					{title}
				</Text>
			</Box>
			{description && (
				<Text color="gray" dimColor>
					{description}
				</Text>
			)}
		</Box>
	)
}
