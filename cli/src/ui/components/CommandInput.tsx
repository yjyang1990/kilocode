/**
 * CommandInput component - input field with autocomplete support
 */

import React, { useEffect, useState } from "react"
import { Box, Text, useInput } from "ink"
import TextInput from "ink-text-input"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
	inputValueAtom,
	setInputValueAtom,
	clearInputAtom,
	showAutocompleteAtom,
	suggestionsAtom,
	argumentSuggestionsAtom,
	selectedSuggestionIndexAtom,
	selectNextSuggestionAtom,
	selectPreviousSuggestionAtom,
	setSuggestionsAtom,
	setArgumentSuggestionsAtom,
} from "../../state/index.js"
import { getAllSuggestions, type CommandSuggestion, type ArgumentSuggestion } from "../../services/autocomplete.js"
import { AutocompleteMenu } from "./AutocompleteMenu.js"

interface CommandInputProps {
	onSubmit: (value: string) => void
	placeholder?: string
	disabled?: boolean
}

export const CommandInput: React.FC<CommandInputProps> = ({
	onSubmit,
	placeholder = "Type a message or /command...",
	disabled = false,
}) => {
	const [inputValue, setInputValue] = useAtom(inputValueAtom)
	const setInputValueAction = useSetAtom(setInputValueAtom)
	const clearInput = useSetAtom(clearInputAtom)
	const showAutocomplete = useAtomValue(showAutocompleteAtom)
	const suggestions = useAtomValue(suggestionsAtom)
	const argumentSuggestions = useAtomValue(argumentSuggestionsAtom)
	const selectedIndex = useAtomValue(selectedSuggestionIndexAtom)
	const selectNext = useSetAtom(selectNextSuggestionAtom)
	const selectPrevious = useSetAtom(selectPreviousSuggestionAtom)
	const setSuggestions = useSetAtom(setSuggestionsAtom)
	const setArgumentSuggestions = useSetAtom(setArgumentSuggestionsAtom)

	// State for suggestion type
	const [suggestionType, setSuggestionType] = useState<"command" | "argument" | "none">("none")
	const [commandSuggestions, setCommandSuggestions] = useState<CommandSuggestion[]>([])
	// Key to force TextInput remount when autocompleting (resets cursor to end)
	const [inputKey, setInputKey] = useState(0)
	// Ref to track if we've already handled the Enter key in autocomplete
	const autocompleteHandledEnter = React.useRef(false)

	// Update suggestions when input changes
	useEffect(() => {
		if (inputValue.startsWith("/")) {
			getAllSuggestions(inputValue).then((result) => {
				setSuggestionType(result.type)

				if (result.type === "command") {
					setCommandSuggestions(result.suggestions)
					setSuggestions(result.suggestions)
					setArgumentSuggestions([])
				} else if (result.type === "argument") {
					setCommandSuggestions([])
					setSuggestions([])
					setArgumentSuggestions(result.suggestions)
				} else {
					setCommandSuggestions([])
					setSuggestions([])
					setArgumentSuggestions([])
				}
			})
		} else {
			setSuggestionType("none")
			setCommandSuggestions([])
			setSuggestions([])
			setArgumentSuggestions([])
		}
	}, [inputValue, setSuggestions, setArgumentSuggestions])

	// Handle keyboard input for autocomplete navigation
	useInput(
		(input, key) => {
			if (disabled) {
				return
			}

			// Only handle autocomplete keys when autocomplete is showing
			if (showAutocomplete) {
				if (key.downArrow) {
					selectNext()
					return
				} else if (key.upArrow) {
					selectPrevious()
					return
				} else if (key.tab) {
					// Select current suggestion with Tab (don't submit)
					if (suggestionType === "command" && commandSuggestions[selectedIndex]) {
						const selected = commandSuggestions[selectedIndex]
						setInputValueAction(`/${selected.command.name} `)
						// Force TextInput remount to reset cursor to end
						setInputKey((k) => k + 1)
					} else if (suggestionType === "argument" && argumentSuggestions[selectedIndex]) {
						const selected = argumentSuggestions[selectedIndex]
						// Replace the last argument with the selected value
						const parts = inputValue.split(" ")
						parts[parts.length - 1] = selected.value
						setInputValueAction(parts.join(" ") + " ")
						// Force TextInput remount to reset cursor to end
						setInputKey((k) => k + 1)
					}
					return
				} else if (key.return && (commandSuggestions.length > 0 || argumentSuggestions.length > 0)) {
					// Select current suggestion and submit with Enter
					let newValue = ""
					if (suggestionType === "command" && commandSuggestions[selectedIndex]) {
						const selected = commandSuggestions[selectedIndex]
						newValue = `/${selected.command.name} `
					} else if (suggestionType === "argument" && argumentSuggestions[selectedIndex]) {
						const selected = argumentSuggestions[selectedIndex]
						// Replace the last argument with the selected value (no trailing space for immediate submission)
						const parts = inputValue.split(" ")
						parts[parts.length - 1] = selected.value
						newValue = parts.join(" ")
					}

					// Update input and submit
					if (newValue.trim()) {
						// Mark that we've handled the Enter key to prevent double submission
						autocompleteHandledEnter.current = true
						// Submit the command immediately
						onSubmit(newValue)
						clearInput()
						// Reset the flag after a short delay
						setTimeout(() => {
							autocompleteHandledEnter.current = false
						}, 100)
					}
					return
				} else if (key.escape) {
					// Clear autocomplete
					clearInput()
					return
				}
			}
		},
		{ isActive: !disabled },
	)

	const handleChange = (value: string) => {
		setInputValueAction(value)
	}

	const handleSubmit = () => {
		// Don't submit if autocomplete already handled the Enter key
		if (autocompleteHandledEnter.current) {
			autocompleteHandledEnter.current = false
			return
		}
		if (inputValue.trim()) {
			onSubmit(inputValue)
			clearInput()
		}
	}

	// Determine if we should let TextInput handle Enter or if autocomplete will handle it
	const hasSuggestions = commandSuggestions.length > 0 || argumentSuggestions.length > 0
	const shouldDisableTextInputSubmit = showAutocomplete && hasSuggestions

	return (
		<Box flexDirection="column">
			{/* Input field */}
			<Box borderStyle="single" borderColor="cyan" paddingX={1}>
				<Text color="cyan" bold>
					{"> "}
				</Text>
				<TextInput
					key={inputKey}
					value={inputValue}
					onChange={handleChange}
					onSubmit={shouldDisableTextInputSubmit ? () => {} : handleSubmit}
					placeholder={placeholder}
					showCursor={!disabled}
				/>
			</Box>

			{/* Autocomplete menu */}
			<AutocompleteMenu
				type={suggestionType}
				commandSuggestions={commandSuggestions}
				argumentSuggestions={argumentSuggestions}
				selectedIndex={selectedIndex}
				visible={showAutocomplete}
			/>
		</Box>
	)
}
