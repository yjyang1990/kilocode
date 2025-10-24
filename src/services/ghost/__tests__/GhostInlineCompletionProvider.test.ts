import * as vscode from "vscode"
import { GhostInlineCompletionProvider } from "../GhostInlineCompletionProvider"
import { GhostSuggestionsState } from "../GhostSuggestions"
import { MockTextDocument } from "../../mocking/MockTextDocument"

describe("GhostInlineCompletionProvider", () => {
	let provider: GhostInlineCompletionProvider
	let mockDocument: vscode.TextDocument
	let mockPosition: vscode.Position
	let mockContext: vscode.InlineCompletionContext
	let mockToken: vscode.CancellationToken

	beforeEach(() => {
		provider = new GhostInlineCompletionProvider()
		mockDocument = new MockTextDocument(vscode.Uri.file("/test.ts"), "const x = 1\nconst y = 2")
		mockPosition = new vscode.Position(0, 11) // After "const x = 1"
		mockContext = {} as vscode.InlineCompletionContext
		mockToken = {} as vscode.CancellationToken
	})

	describe("provideInlineCompletionItems", () => {
		it("should return empty array when no suggestions are set", () => {
			const result = provider.provideInlineCompletionItems(mockDocument, mockPosition, mockContext, mockToken)
			expect(result).toEqual([])
		})

		it("should return empty array when suggestions have no FIM content", () => {
			const suggestions = new GhostSuggestionsState()
			provider.updateSuggestions(suggestions)

			const result = provider.provideInlineCompletionItems(mockDocument, mockPosition, mockContext, mockToken)
			expect(result).toEqual([])
		})

		it("should return inline completion item when FIM content is available and prefix/suffix match", () => {
			const suggestions = new GhostSuggestionsState()
			const fimContent = {
				text: "console.log('Hello, World!');",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			}
			suggestions.setFillInAtCursor(fimContent)
			provider.updateSuggestions(suggestions)

			const result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]

			expect(result).toHaveLength(1)
			expect(result[0].insertText).toBe(fimContent.text)
			expect(result[0].range).toEqual(new vscode.Range(mockPosition, mockPosition))
			// No command property - VSCode handles acceptance automatically
			expect(result[0].command).toBeUndefined()
		})

		it("should return empty array when prefix does not match", () => {
			const suggestions = new GhostSuggestionsState()
			const fimContent = {
				text: "console.log('Hello, World!');",
				prefix: "different prefix",
				suffix: "\nconst y = 2",
			}
			suggestions.setFillInAtCursor(fimContent)
			provider.updateSuggestions(suggestions)

			const result = provider.provideInlineCompletionItems(mockDocument, mockPosition, mockContext, mockToken)

			expect(result).toEqual([])
		})

		it("should return empty array when suffix does not match", () => {
			const suggestions = new GhostSuggestionsState()
			const fimContent = {
				text: "console.log('Hello, World!');",
				prefix: "const x = 1",
				suffix: "different suffix",
			}
			suggestions.setFillInAtCursor(fimContent)
			provider.updateSuggestions(suggestions)

			const result = provider.provideInlineCompletionItems(mockDocument, mockPosition, mockContext, mockToken)

			expect(result).toEqual([])
		})

		it("should return empty array after suggestions are cleared", () => {
			const suggestions = new GhostSuggestionsState()
			suggestions.setFillInAtCursor({
				text: "test content",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions)

			// Clear suggestions
			provider.updateSuggestions(null)

			const result = provider.provideInlineCompletionItems(mockDocument, mockPosition, mockContext, mockToken)
			expect(result).toEqual([])
		})

		it("should update suggestions when called multiple times", () => {
			const suggestions1 = new GhostSuggestionsState()
			suggestions1.setFillInAtCursor({
				text: "first suggestion",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions1)

			let result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("first suggestion")

			const suggestions2 = new GhostSuggestionsState()
			suggestions2.setFillInAtCursor({
				text: "second suggestion",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions2)

			result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("second suggestion")
		})
		it("should maintain a rolling window of suggestions and match from most recent", () => {
			// Add first suggestion
			const suggestions1 = new GhostSuggestionsState()
			suggestions1.setFillInAtCursor({
				text: "first suggestion",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions1)

			// Add second suggestion with different context
			const suggestions2 = new GhostSuggestionsState()
			suggestions2.setFillInAtCursor({
				text: "second suggestion",
				prefix: "const a = 1",
				suffix: "\nconst b = 2",
			})
			provider.updateSuggestions(suggestions2)

			// Should match the first suggestion when context matches
			let result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("first suggestion")

			// Should match the second suggestion when context matches
			const mockDocument2 = new MockTextDocument(vscode.Uri.file("/test2.ts"), "const a = 1\nconst b = 2")
			const mockPosition2 = new vscode.Position(0, 11)
			result = provider.provideInlineCompletionItems(
				mockDocument2,
				mockPosition2,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("second suggestion")
		})

		it("should prefer most recent matching suggestion when multiple match", () => {
			// Add first suggestion
			const suggestions1 = new GhostSuggestionsState()
			suggestions1.setFillInAtCursor({
				text: "first suggestion",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions1)

			// Add second suggestion with same context
			const suggestions2 = new GhostSuggestionsState()
			suggestions2.setFillInAtCursor({
				text: "second suggestion",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions2)

			// Should return the most recent (second) suggestion
			const result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("second suggestion")
		})

		it("should maintain only the last 20 suggestions (FIFO)", () => {
			// Add 25 suggestions
			for (let i = 0; i < 25; i++) {
				const suggestions = new GhostSuggestionsState()
				suggestions.setFillInAtCursor({
					text: `suggestion ${i}`,
					prefix: `const x${i} = 1`,
					suffix: `\nconst y${i} = 2`,
				})
				provider.updateSuggestions(suggestions)
			}

			// The first 5 suggestions should be removed (0-4)
			// Try to match suggestion 0 (should not be found)
			const mockDocument0 = new MockTextDocument(vscode.Uri.file("/test0.ts"), "const x0 = 1\nconst y0 = 2")
			const mockPosition0 = new vscode.Position(0, 12)
			let result = provider.provideInlineCompletionItems(mockDocument0, mockPosition0, mockContext, mockToken)
			expect(result).toEqual([])

			// Try to match suggestion 5 (should be found - it's the oldest in the window)
			const mockDocument5 = new MockTextDocument(vscode.Uri.file("/test5.ts"), "const x5 = 1\nconst y5 = 2")
			const mockPosition5 = new vscode.Position(0, 12)
			result = provider.provideInlineCompletionItems(
				mockDocument5,
				mockPosition5,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("suggestion 5")

			// Try to match suggestion 24 (should be found - it's the most recent)
			const mockDocument24 = new MockTextDocument(vscode.Uri.file("/test24.ts"), "const x24 = 1\nconst y24 = 2")
			const mockPosition24 = new vscode.Position(0, 13)
			result = provider.provideInlineCompletionItems(
				mockDocument24,
				mockPosition24,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result[0].insertText).toBe("suggestion 24")
		})
		it("should not add duplicate suggestions", () => {
			const suggestions1 = new GhostSuggestionsState()
			suggestions1.setFillInAtCursor({
				text: "console.log('test')",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions1)

			// Try to add the same suggestion again
			const suggestions2 = new GhostSuggestionsState()
			suggestions2.setFillInAtCursor({
				text: "console.log('test')",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions2)

			// Add a different suggestion
			const suggestions3 = new GhostSuggestionsState()
			suggestions3.setFillInAtCursor({
				text: "console.log('different')",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions3)

			// Should return the most recent non-duplicate suggestion
			const result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]

			// Should get the different suggestion (suggestions3), not the duplicate
			expect(result[0].insertText).toBe("console.log('different')")
		})

		it("should allow same text with different prefix/suffix", () => {
			const suggestions1 = new GhostSuggestionsState()
			suggestions1.setFillInAtCursor({
				text: "console.log('test')",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions1)

			// Same text but different context - should be added
			const suggestions2 = new GhostSuggestionsState()
			suggestions2.setFillInAtCursor({
				text: "console.log('test')",
				prefix: "const a = 1",
				suffix: "\nconst b = 2",
			})
			provider.updateSuggestions(suggestions2)

			// Should match the second suggestion when context matches
			const mockDocument2 = new MockTextDocument(vscode.Uri.file("/test2.ts"), "const a = 1\nconst b = 2")
			const mockPosition2 = new vscode.Position(0, 11)
			const result = provider.provideInlineCompletionItems(
				mockDocument2,
				mockPosition2,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]

			expect(result[0].insertText).toBe("console.log('test')")
		})
	})

	describe("updateSuggestions", () => {
		it("should accept null to clear suggestions", () => {
			const suggestions = new GhostSuggestionsState()
			suggestions.setFillInAtCursor({
				text: "test",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})
			provider.updateSuggestions(suggestions)

			provider.updateSuggestions(null)

			const result = provider.provideInlineCompletionItems(mockDocument, mockPosition, mockContext, mockToken)
			expect(result).toEqual([])
		})

		it("should accept new suggestions state", () => {
			const suggestions = new GhostSuggestionsState()
			suggestions.setFillInAtCursor({
				text: "new content",
				prefix: "const x = 1",
				suffix: "\nconst y = 2",
			})

			provider.updateSuggestions(suggestions)

			const result = provider.provideInlineCompletionItems(
				mockDocument,
				mockPosition,
				mockContext,
				mockToken,
			) as vscode.InlineCompletionItem[]
			expect(result).toHaveLength(1)
			expect(result[0].insertText).toBe("new content")
		})
	})
})
