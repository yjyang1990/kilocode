/**
 * Jotai atoms for state management in the command-based UI
 */

import { atom } from "jotai"
import type { Message } from "../types/ui.js"
import type { CommandSuggestion, ArgumentSuggestion } from "../services/autocomplete.js"

// Core UI state atoms
export const messagesAtom = atom<Message[]>([])

export const inputValueAtom = atom<string>("")

export const isProcessingAtom = atom<boolean>(false)

export const currentModeAtom = atom<string>("code")

export const errorAtom = atom<string | null>(null)

// Autocomplete state atoms
export const showAutocompleteAtom = atom<boolean>(false)

export const suggestionsAtom = atom<CommandSuggestion[]>([])

export const argumentSuggestionsAtom = atom<ArgumentSuggestion[]>([])

export const selectedSuggestionIndexAtom = atom<number>(0)

// Derived atom to get the total count of suggestions (command or argument)
export const suggestionCountAtom = atom((get) => {
	const commandSuggestions = get(suggestionsAtom)
	const argumentSuggestions = get(argumentSuggestionsAtom)
	return commandSuggestions.length > 0 ? commandSuggestions.length : argumentSuggestions.length
})

// Derived atoms
export const isCommandInputAtom = atom((get) => {
	const input = get(inputValueAtom)
	return input.startsWith("/")
})

export const commandQueryAtom = atom((get) => {
	const input = get(inputValueAtom)
	return get(isCommandInputAtom) ? input.slice(1) : ""
})

// Actions atoms (write-only)
export const addMessageAtom = atom(null, (get, set, message: Message) => {
	const messages = get(messagesAtom)
	set(messagesAtom, [...messages, message])
})

export const clearMessagesAtom = atom(null, (get, set) => {
	set(messagesAtom, [])
})

export const updateLastMessageAtom = atom(null, (get, set, content: string) => {
	const messages = get(messagesAtom)
	if (messages.length === 0) return

	const lastMessage = messages[messages.length - 1]
	if (!lastMessage) return

	const updatedMessage: Message = {
		id: lastMessage.id,
		type: lastMessage.type,
		timestamp: lastMessage.timestamp,
		content,
		partial: false,
	}
	const updatedMessages = [...messages.slice(0, -1), updatedMessage]
	set(messagesAtom, updatedMessages)
})

export const setInputValueAtom = atom(null, (get, set, value: string) => {
	set(inputValueAtom, value)

	// Update autocomplete visibility based on input
	// Keep showing suggestions even for exact matches (e.g., "/mode")
	// This provides visual confirmation that the user has typed a valid command
	const isCommand = value.startsWith("/")
	set(showAutocompleteAtom, isCommand)

	// Reset selected index when input changes
	if (isCommand) {
		set(selectedSuggestionIndexAtom, 0)
	}
})

export const clearInputAtom = atom(null, (get, set) => {
	set(inputValueAtom, "")
	set(showAutocompleteAtom, false)
	set(selectedSuggestionIndexAtom, 0)
})

export const setSuggestionsAtom = atom(null, (get, set, suggestions: CommandSuggestion[]) => {
	set(suggestionsAtom, suggestions)
	set(selectedSuggestionIndexAtom, 0)
})

export const setArgumentSuggestionsAtom = atom(null, (get, set, suggestions: ArgumentSuggestion[]) => {
	set(argumentSuggestionsAtom, suggestions)
	set(selectedSuggestionIndexAtom, 0)
})

export const selectNextSuggestionAtom = atom(null, (get, set) => {
	const count = get(suggestionCountAtom)
	if (count === 0) return

	const currentIndex = get(selectedSuggestionIndexAtom)
	const nextIndex = (currentIndex + 1) % count
	set(selectedSuggestionIndexAtom, nextIndex)
})

export const selectPreviousSuggestionAtom = atom(null, (get, set) => {
	const count = get(suggestionCountAtom)
	if (count === 0) return

	const currentIndex = get(selectedSuggestionIndexAtom)
	const prevIndex = currentIndex === 0 ? count - 1 : currentIndex - 1
	set(selectedSuggestionIndexAtom, prevIndex)
})

export const setErrorAtom = atom(null, (get, set, error: string | null) => {
	set(errorAtom, error)

	// Auto-clear error after 5 seconds
	if (error) {
		setTimeout(() => {
			set(errorAtom, null)
		}, 5000)
	}
})
