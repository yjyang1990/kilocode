import * as vscode from "vscode"
import { FillInAtCursorSuggestion, GhostSuggestionsState } from "./GhostSuggestions"
import { extractPrefixSuffix } from "./types"

const MAX_SUGGESTIONS_HISTORY = 20

export class GhostInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
	private suggestionsHistory: FillInAtCursorSuggestion[] = []

	public updateSuggestions(suggestions: GhostSuggestionsState): void {
		const fillInAtCursor = suggestions.getFillInAtCursor()

		// Only store if we have a fill-in suggestion
		if (!fillInAtCursor) {
			return
		}

		// Check if this suggestion already exists in the history
		const isDuplicate = this.suggestionsHistory.some(
			(existing) =>
				existing.text === fillInAtCursor.text &&
				existing.prefix === fillInAtCursor.prefix &&
				existing.suffix === fillInAtCursor.suffix,
		)

		// Skip adding if it's a duplicate
		if (isDuplicate) {
			return
		}

		// Add to the end of the array (most recent)
		this.suggestionsHistory.push(fillInAtCursor)

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
			const fillInAtCursor = this.suggestionsHistory[i]

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
