/**
 * FollowupSuggestionsMenu component - displays followup question suggestions
 * Similar to AutocompleteMenu but for followup question responses
 */

import React from "react"
import { Box, Text } from "ink"
import type { FollowupSuggestion } from "../../state/atoms/ui.js"

interface FollowupSuggestionsMenuProps {
	suggestions: FollowupSuggestion[]
	selectedIndex: number
	visible: boolean
}

export const FollowupSuggestionsMenu: React.FC<FollowupSuggestionsMenuProps> = ({
	suggestions,
	selectedIndex,
	visible,
}) => {
	if (!visible || suggestions.length === 0) {
		return null
	}

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1}>
			<Text bold color="yellow">
				Suggestions:
			</Text>
			{suggestions.map((suggestion, index) => (
				<SuggestionRow key={index} suggestion={suggestion} index={index} isSelected={index === selectedIndex} />
			))}
			<Box marginTop={1}>
				<Text color="gray" dimColor>
					↑↓ Navigate • Tab Fill • Enter Submit
				</Text>
			</Box>
		</Box>
	)
}

interface SuggestionRowProps {
	suggestion: FollowupSuggestion
	index: number
	isSelected: boolean
}

const SuggestionRow: React.FC<SuggestionRowProps> = ({ suggestion, index, isSelected }) => {
	return (
		<Box>
			{isSelected && (
				<Text color="yellow" bold>
					{">"}{" "}
				</Text>
			)}
			{!isSelected && <Text>{"  "}</Text>}

			<Text color={isSelected ? "yellow" : "white"} bold={isSelected}>
				{index + 1}. {suggestion.answer}
			</Text>

			{suggestion.mode && (
				<>
					<Text color="gray"> - </Text>
					<Text color={isSelected ? "white" : "gray"}>switch to {suggestion.mode}</Text>
				</>
			)}
		</Box>
	)
}
