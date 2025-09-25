import React from "react"
import { Box, Text } from "ink"
import { getProviderLabel } from "../../../../../../constants/providers/index.js"
import type { ProviderName } from "../../../../../../types/messages.js"

interface ProviderSelectorProps {
	currentProvider: ProviderName | undefined
	focusMode: string
	onSelectProvider: () => void
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({ currentProvider, focusMode, onSelectProvider }) => {
	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>API Provider</Text>

			<Box flexDirection="row" alignItems="center" gap={1}>
				<Text color={focusMode === "provider-select" ? "cyan" : "white"}>
					{focusMode === "provider-select" ? "❯ " : "  "}
					{getProviderLabel(currentProvider)}
				</Text>
			</Box>
		</Box>
	)
}
