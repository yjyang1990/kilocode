/**
 * CommandInput component - input field with autocomplete support
 * Updated to use useCommandInput and useWebviewMessage hooks
 */

import React, { useEffect, useRef } from "react"
import { Box, Text, useInput } from "ink"
import TextInput from "ink-text-input"
import { useCommandInput } from "../../state/hooks/useCommandInput.js"
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
	// Use the command input hook for autocomplete functionality
	const {
		inputValue,
		setInput,
		clearInput,
		isAutocompleteVisible,
		commandSuggestions,
		argumentSuggestions,
		selectedIndex,
		selectNext,
		selectPrevious,
		selectedSuggestion,
	} = useCommandInput()

	// Key to force TextInput remount when autocompleting (resets cursor to end)
	const [inputKey, setInputKey] = React.useState(0)
	// Ref to track if we've already handled the Enter key in autocomplete
	const autocompleteHandledEnter = useRef(false)

	// Handle keyboard input for autocomplete navigation
	useInput(
		(input, key) => {
			if (disabled) {
				return
			}

			// Only handle autocomplete keys when autocomplete is showing
			if (isAutocompleteVisible) {
				if (key.downArrow) {
					selectNext()
					return
				} else if (key.upArrow) {
					selectPrevious()
					return
				} else if (key.tab) {
					// Select current suggestion with Tab (don't submit)
					if (selectedSuggestion) {
						if ("command" in selectedSuggestion) {
							// Command suggestion
							setInput(`/${selectedSuggestion.command.name} `)
						} else {
							// Argument suggestion
							const parts = inputValue.split(" ")
							parts[parts.length - 1] = selectedSuggestion.value
							setInput(parts.join(" ") + " ")
						}
						// Force TextInput remount to reset cursor to end
						setInputKey((k) => k + 1)
					}
					return
				} else if (key.return && (commandSuggestions.length > 0 || argumentSuggestions.length > 0)) {
					// Select current suggestion and submit with Enter
					let newValue = ""
					if (selectedSuggestion) {
						if ("command" in selectedSuggestion) {
							// Command suggestion
							newValue = `/${selectedSuggestion.command.name} `
						} else {
							// Argument suggestion - replace the last argument
							const parts = inputValue.split(" ")
							parts[parts.length - 1] = selectedSuggestion.value
							newValue = parts.join(" ")
						}
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
		setInput(value)
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
	const shouldDisableTextInputSubmit = isAutocompleteVisible && hasSuggestions

	// Determine suggestion type for autocomplete menu
	const suggestionType =
		commandSuggestions.length > 0 ? "command" : argumentSuggestions.length > 0 ? "argument" : "none"

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
				visible={isAutocompleteVisible}
			/>
		</Box>
	)
}
