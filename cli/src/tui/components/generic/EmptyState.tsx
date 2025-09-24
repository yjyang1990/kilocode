import React from "react"
import { Box, Text } from "ink"
import Spinner from "ink-spinner"
import type { EmptyStateProps } from "../../types/components.js"

/**
 * Reusable empty state component that provides consistent styling
 * for loading states, empty lists, and error states across the TUI
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	description,
	isLoading = false,
	loadingText = "Loading...",
	actions,
}) => {
	return (
		<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
			{isLoading ? (
				<>
					<Box marginBottom={1}>
						<Spinner type="dots" />
						<Text color="blue"> {loadingText}</Text>
					</Box>
				</>
			) : (
				<>
					<Text color="gray" bold>
						{icon} {title}
					</Text>
					{description && (
						<Box flexDirection="column" alignItems="center" marginTop={1}>
							{Array.isArray(description) ? (
								description.map((line, index) => (
									<Text key={index} color="gray" dimColor>
										{line}
									</Text>
								))
							) : (
								<Text color="gray" dimColor>
									{description}
								</Text>
							)}
						</Box>
					)}
					{actions && (
						<Box marginTop={1} alignItems="center">
							{actions}
						</Box>
					)}
				</>
			)}
		</Box>
	)
}
