import * as vscode from "vscode"
import { GhostSuggestionsState } from "./GhostSuggestions"
import { extractPrefixSuffix } from "./types"

const MAX_SUGGESTIONS_HISTORY = 20

export class GhostInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
	private suggestionsHistory: GhostSuggestionsState[] = []

	public updateSuggestions(suggestions: GhostSuggestionsState | null): void {
		if (suggestions == null) {
			return
		}

		const fillInAtCursor = suggestions.getFillInAtCursor()

		// Check if this suggestion already exists in the history
		if (fillInAtCursor) {
			const isDuplicate = this.suggestionsHistory.some((existingSuggestion) => {
				const existingFillIn = existingSuggestion.getFillInAtCursor()
				return (
					existingFillIn &&
					existingFillIn.text === fillInAtCursor.text &&
					existingFillIn.prefix === fillInAtCursor.prefix &&
					existingFillIn.suffix === fillInAtCursor.suffix
				)
			})

			// Skip adding if it's a duplicate
			if (isDuplicate) {
				return
			}
		}

		// Add to the end of the array (most recent)
		this.suggestionsHistory.push(suggestions)

		// Remove oldest if we exceed the limit
		if (this.suggestionsHistory.length > MAX_SUGGESTIONS_HISTORY) {
			this.suggestionsHistory.shift()
		}
	}

	public provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		_context: vscode.InlineCompletionContext,
		_token: vscode.CancellationToken,
	): vscode.ProviderResult<vscode.InlineCompletionItem[] | vscode.InlineCompletionList> {
		const { prefix, suffix } = extractPrefixSuffix(document, position)

		// Search from most recent to least recent
		for (let i = this.suggestionsHistory.length - 1; i >= 0; i--) {
			const suggestions = this.suggestionsHistory[i]
			const fillInAtCursor = suggestions?.getFillInAtCursor()

			if (!fillInAtCursor) {
				continue
			}

			// First, try exact prefix/suffix match
			if (prefix === fillInAtCursor.prefix && suffix === fillInAtCursor.suffix) {
				const item: vscode.InlineCompletionItem = {
					insertText: fillInAtCursor.text,
					range: new vscode.Range(position, position),
				}
				return [item]
			}

			// If no exact match, check for partial typing
			// The user may have started typing the suggested text
			if (prefix.startsWith(fillInAtCursor.prefix) && suffix === fillInAtCursor.suffix) {
				// Extract what the user has typed between the original prefix and current position
				const typedContent = prefix.substring(fillInAtCursor.prefix.length)

				// Check if the typed content matches the beginning of the suggestion
				if (fillInAtCursor.text.startsWith(typedContent)) {
					// Return the remaining part of the suggestion (with already-typed portion removed)
					const remainingText = fillInAtCursor.text.substring(typedContent.length)
					const item: vscode.InlineCompletionItem = {
						insertText: remainingText,
						range: new vscode.Range(position, position),
					}
					return [item]
				}
			}
		}

		return []
	}
}
