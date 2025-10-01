import { LLMClient } from "./llm-client.js"
import { AutoTriggerStrategy } from "../services/ghost/strategies/AutoTriggerStrategy.js"
import { GhostSuggestionContext } from "../services/ghost/types.js"
import { MockTextDocument } from "../services/mocking/MockTextDocument.js"
import { CURSOR_MARKER } from "../services/ghost/ghostConstants.js"
import { GhostStreamingParser } from "../services/ghost/GhostStreamingParser.js"
import * as vscode from "./mock-vscode.js"

export class AutoTriggerStrategyTester {
	private llmClient: LLMClient
	private strategy: AutoTriggerStrategy

	constructor(llmClient: LLMClient) {
		this.llmClient = llmClient
		this.strategy = new AutoTriggerStrategy()
	}

	/**
	 * Converts test input to GhostSuggestionContext
	 */
	private createContext(code: string, cursorPosition: { line: number; character: number }): GhostSuggestionContext {
		const lines = code.split("\n")
		const line = lines[cursorPosition.line]
		lines[cursorPosition.line] =
			line.slice(0, cursorPosition.character) + CURSOR_MARKER + line.slice(cursorPosition.character)
		const codeWithMarker = lines.join("\n")

		const uri = vscode.Uri.parse("file:///test.js")
		const document = new MockTextDocument(uri, codeWithMarker)
		const position = new vscode.Position(cursorPosition.line, cursorPosition.character)
		const range = new vscode.Range(position, position)

		return {
			document: document as any,
			range,
			recentOperations: [],
			diagnostics: [],
			openFiles: [],
			userInput: undefined,
			rangeASTNode: undefined,
		}
	}

	getSystemInstructions(): string {
		// Use the actual strategy's system instructions
		return this.strategy.getSystemInstructions()
	}

	buildUserPrompt(code: string, cursorPosition: { line: number; character: number }): string {
		const context = this.createContext(code, cursorPosition)
		return this.strategy.getUserPrompt(context)
	}

	async getCompletion(code: string, cursorPosition: { line: number; character: number }): Promise<string> {
		const systemPrompt = this.getSystemInstructions()
		const userPrompt = this.buildUserPrompt(code, cursorPosition)

		const response = await this.llmClient.sendPrompt(systemPrompt, userPrompt)
		return response.content
	}

	parseCompletion(xmlResponse: string): { search: string; replace: string }[] {
		const parser = new GhostStreamingParser()

		const dummyContext: GhostSuggestionContext = {
			document: new MockTextDocument(vscode.Uri.parse("file:///test.js"), "") as any,
			range: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
		}

		parser.initialize(dummyContext)
		parser.processChunk(xmlResponse)
		parser.finishStream()

		return parser.getCompletedChanges()
	}
}
