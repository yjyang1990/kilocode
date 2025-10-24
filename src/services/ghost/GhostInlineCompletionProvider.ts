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

			if (fillInAtCursor && prefix === fillInAtCursor.prefix && suffix === fillInAtCursor.suffix) {
				const item: vscode.InlineCompletionItem = {
					insertText: fillInAtCursor.text,
					range: new vscode.Range(position, position),
				}
				return [item]
			}
		}

		return []
	}
}
