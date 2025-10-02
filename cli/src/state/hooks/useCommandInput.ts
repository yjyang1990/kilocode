/**
 * Hook for managing command input and autocomplete
 * Provides input state, autocomplete suggestions, and command execution
 */

import { useAtomValue, useSetAtom } from "jotai"
import { useMemo, useCallback, useEffect } from "react"
import type { CommandSuggestion, ArgumentSuggestion } from "../../services/autocomplete.js"
import {
	getSuggestions,
	getArgumentSuggestions,
	detectInputState,
	isCommandInput as checkIsCommandInput,
} from "../../services/autocomplete.js"
import {
	inputValueAtom,
	showAutocompleteAtom,
	suggestionsAtom,
	argumentSuggestionsAtom,
	selectedSuggestionIndexAtom,
	suggestionCountAtom,
	isCommandInputAtom,
	commandQueryAtom,
	setInputValueAtom,
	clearInputAtom,
	setSuggestionsAtom,
	setArgumentSuggestionsAtom,
	selectNextSuggestionAtom,
	selectPreviousSuggestionAtom,
	hideAutocompleteAtom,
	showAutocompleteMenuAtom,
	getSelectedSuggestionAtom,
} from "../atoms/ui.js"

/**
 * Return type for useCommandInput hook
 */
export interface UseCommandInputReturn {
	/** Current input value */
	inputValue: string
	/** Whether autocomplete menu is visible */
	isAutocompleteVisible: boolean
	/** Command suggestions (empty if showing argument suggestions) */
	commandSuggestions: CommandSuggestion[]
	/** Argument suggestions (empty if showing command suggestions) */
	argumentSuggestions: ArgumentSuggestion[]
	/** Index of currently selected suggestion */
	selectedIndex: number
	/** Total count of suggestions */
	suggestionCount: number
	/** Whether input is a command (starts with /) */
	isCommand: boolean
	/** Command query (input without leading /) */
	commandQuery: string
	/** Currently selected suggestion */
	selectedSuggestion: CommandSuggestion | ArgumentSuggestion | null
	/** Set input value and update suggestions */
	setInput: (value: string) => void
	/** Clear input and hide autocomplete */
	clearInput: () => void
	/** Select next suggestion */
	selectNext: () => void
	/** Select previous suggestion */
	selectPrevious: () => void
	/** Hide autocomplete menu */
	hideAutocomplete: () => void
	/** Show autocomplete menu */
	showAutocompleteMenu: () => void
	/** Update suggestions based on current input */
	updateSuggestions: () => Promise<void>
	/** Get the input state (command, argument, or none) */
	getInputState: () => ReturnType<typeof detectInputState>
}

/**
 * Hook for managing command input and autocomplete
 *
 * Provides comprehensive input management including autocomplete suggestions,
 * keyboard navigation, and command execution helpers. Automatically updates
 * suggestions as the user types.
 *
 * @example
 * ```tsx
 * function CommandInput() {
 *   const {
 *     inputValue,
 *     setInput,
 *     commandSuggestions,
 *     isAutocompleteVisible,
 *     selectNext,
 *     selectPrevious,
 *     selectedIndex
 *   } = useCommandInput()
 *
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if (e.key === 'ArrowDown') {
 *       e.preventDefault()
 *       selectNext()
 *     } else if (e.key === 'ArrowUp') {
 *       e.preventDefault()
 *       selectPrevious()
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <input
 *         value={inputValue}
 *         onChange={e => setInput(e.target.value)}
 *         onKeyDown={handleKeyDown}
 *       />
 *       {isAutocompleteVisible && (
 *         <ul>
 *           {commandSuggestions.map((suggestion, i) => (
 *             <li key={i} className={i === selectedIndex ? 'selected' : ''}>
 *               {suggestion.command.name}
 *             </li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCommandInput(): UseCommandInputReturn {
	// Read atoms
	const inputValue = useAtomValue(inputValueAtom)
	const showAutocomplete = useAtomValue(showAutocompleteAtom)
	const commandSuggestions = useAtomValue(suggestionsAtom)
	const argumentSuggestions = useAtomValue(argumentSuggestionsAtom)
	const selectedIndex = useAtomValue(selectedSuggestionIndexAtom)
	const suggestionCount = useAtomValue(suggestionCountAtom)
	const isCommand = useAtomValue(isCommandInputAtom)
	const commandQuery = useAtomValue(commandQueryAtom)
	const selectedSuggestion = useAtomValue(getSelectedSuggestionAtom)

	// Write atoms
	const setInputAction = useSetAtom(setInputValueAtom)
	const clearInputAction = useSetAtom(clearInputAtom)
	const setSuggestionsAction = useSetAtom(setSuggestionsAtom)
	const setArgumentSuggestionsAction = useSetAtom(setArgumentSuggestionsAtom)
	const selectNextAction = useSetAtom(selectNextSuggestionAtom)
	const selectPreviousAction = useSetAtom(selectPreviousSuggestionAtom)
	const hideAutocompleteAction = useSetAtom(hideAutocompleteAtom)
	const showAutocompleteAction = useSetAtom(showAutocompleteMenuAtom)

	// Actions
	const setInput = useCallback(
		(value: string) => {
			setInputAction(value)
		},
		[setInputAction],
	)

	const clearInput = useCallback(() => {
		clearInputAction()
	}, [clearInputAction])

	const selectNext = useCallback(() => {
		selectNextAction()
	}, [selectNextAction])

	const selectPrevious = useCallback(() => {
		selectPreviousAction()
	}, [selectPreviousAction])

	const hideAutocomplete = useCallback(() => {
		hideAutocompleteAction()
	}, [hideAutocompleteAction])

	const showAutocompleteMenu = useCallback(() => {
		showAutocompleteAction()
	}, [showAutocompleteAction])

	const updateSuggestions = useCallback(async () => {
		if (!checkIsCommandInput(inputValue)) {
			setSuggestionsAction([])
			setArgumentSuggestionsAction([])
			return
		}

		const state = detectInputState(inputValue)

		if (state.type === "command") {
			// Get command suggestions
			const suggestions = getSuggestions(inputValue)
			setSuggestionsAction(suggestions)
			setArgumentSuggestionsAction([])
		} else if (state.type === "argument") {
			// Get argument suggestions
			const suggestions = await getArgumentSuggestions(inputValue)
			setArgumentSuggestionsAction(suggestions)
			setSuggestionsAction([])
		} else {
			setSuggestionsAction([])
			setArgumentSuggestionsAction([])
		}
	}, [inputValue, setSuggestionsAction, setArgumentSuggestionsAction])

	const getInputState = useCallback(() => {
		return detectInputState(inputValue)
	}, [inputValue])

	// Auto-update suggestions when input changes
	useEffect(() => {
		if (checkIsCommandInput(inputValue)) {
			updateSuggestions()
		}
	}, [inputValue, updateSuggestions])

	// Memoize return value
	return useMemo(
		() => ({
			inputValue,
			isAutocompleteVisible: showAutocomplete,
			commandSuggestions,
			argumentSuggestions,
			selectedIndex,
			suggestionCount,
			isCommand,
			commandQuery,
			selectedSuggestion,
			setInput,
			clearInput,
			selectNext,
			selectPrevious,
			hideAutocomplete,
			showAutocompleteMenu,
			updateSuggestions,
			getInputState,
		}),
		[
			inputValue,
			showAutocomplete,
			commandSuggestions,
			argumentSuggestions,
			selectedIndex,
			suggestionCount,
			isCommand,
			commandQuery,
			selectedSuggestion,
			setInput,
			clearInput,
			selectNext,
			selectPrevious,
			hideAutocomplete,
			showAutocompleteMenu,
			updateSuggestions,
			getInputState,
		],
	)
}
