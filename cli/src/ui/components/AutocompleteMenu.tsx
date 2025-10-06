/**
 * AutocompleteMenu component - displays command and argument suggestions
 */

import React from "react"
import { Box, Text } from "ink"
import type { CommandSuggestion, ArgumentSuggestion } from "../../services/autocomplete.js"

interface AutocompleteMenuProps {
	type: "command" | "argument" | "none"
	commandSuggestions?: CommandSuggestion[]
	argumentSuggestions?: ArgumentSuggestion[]
	selectedIndex: number
	visible: boolean
}

export const AutocompleteMenu: React.FC<AutocompleteMenuProps> = ({
	type,
	commandSuggestions,
	argumentSuggestions,
	selectedIndex,
	visible,
}) => {
	if (!visible || type === "none") {
		return null
	}

	if (type === "command" && commandSuggestions && commandSuggestions.length > 0) {
		return <SuggestionsMenu type="command" suggestions={commandSuggestions} selectedIndex={selectedIndex} />
	}

	if (type === "argument" && argumentSuggestions && argumentSuggestions.length > 0) {
		return <SuggestionsMenu type="argument" suggestions={argumentSuggestions} selectedIndex={selectedIndex} />
	}

	return null
}

interface SuggestionsMenuProps {
	type: "command" | "argument"
	suggestions: CommandSuggestion[] | ArgumentSuggestion[]
	selectedIndex: number
}

const SuggestionsMenu: React.FC<SuggestionsMenuProps> = ({ type, suggestions, selectedIndex }) => {
	const VISIBLE_ITEMS = 5
	const totalItems = suggestions.length

	// Calculate scrolling window to keep selected item centered when possible
	let windowStart = 0
	if (totalItems > VISIBLE_ITEMS) {
		// Try to center the selected item (position 2 in the window)
		windowStart = Math.max(0, selectedIndex - 2)
		// Don't scroll past the end
		windowStart = Math.min(windowStart, totalItems - VISIBLE_ITEMS)
	}

	const windowEnd = Math.min(windowStart + VISIBLE_ITEMS, totalItems)
	const displaySuggestions = suggestions.slice(windowStart, windowEnd)

	const title = type === "command" ? "Commands:" : "Arguments:"
	const borderColor = type === "command" ? "gray" : "cyan"

	return (
		<Box
			flexDirection="column"
			borderStyle="single"
			borderColor={borderColor}
			paddingX={1}
			marginTop={1}
			marginBottom={1}>
			<Text bold color="cyan">
				{title}
			</Text>
			{displaySuggestions.map((suggestion, displayIndex) => {
				const actualIndex = windowStart + displayIndex
				return (
					<SuggestionRow
						key={
							type === "command"
								? (suggestion as CommandSuggestion).command.name
								: (suggestion as ArgumentSuggestion).value || actualIndex
						}
						type={type}
						suggestion={suggestion}
						isSelected={actualIndex === selectedIndex}
					/>
				)
			})}
			<Box marginTop={1}>
				<Text color="gray" dimColor>
					↑↓ Navigate • Tab/Enter Select • Esc Cancel
				</Text>
			</Box>
		</Box>
	)
}

interface SuggestionRowProps {
	type: "command" | "argument"
	suggestion: CommandSuggestion | ArgumentSuggestion
	isSelected: boolean
}

const SuggestionRow: React.FC<SuggestionRowProps> = ({ type, suggestion, isSelected }) => {
	return (
		<Box>
			{isSelected && (
				<Text color="green" bold>
					{">"}{" "}
				</Text>
			)}
			{!isSelected && <Text>{"  "}</Text>}

			{type === "argument" && (suggestion as ArgumentSuggestion).loading && <Text color="yellow">⏳ </Text>}
			{type === "argument" && (suggestion as ArgumentSuggestion).error && <Text color="red">❌ </Text>}

			<Text color={isSelected ? "green" : "white"} bold={isSelected}>
				{type === "command"
					? `/${(suggestion as CommandSuggestion).command.name}`
					: (suggestion as ArgumentSuggestion).value}
			</Text>

			{((type === "command" && (suggestion as CommandSuggestion).command.description) ||
				(type === "argument" && (suggestion as ArgumentSuggestion).description)) && (
				<>
					<Text color="gray"> - </Text>
					<Text color={isSelected ? "white" : "gray"}>
						{type === "command"
							? (suggestion as CommandSuggestion).command.description
							: (suggestion as ArgumentSuggestion).description}
					</Text>
				</>
			)}
		</Box>
	)
}
