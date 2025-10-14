import { GhostSuggestionContext } from "../types"
import { PromptStrategy } from "../types/PromptStrategy"
import { CURSOR_MARKER } from "../ghostConstants"
import { formatDocumentWithCursor, getBaseSystemInstructions } from "./StrategyHelpers"
import { cleanComment, extractComment, isCommentLine } from "./CommentHelpers"

export class CommentDrivenStrategy implements PromptStrategy {
	name = "Comment Driven"

	canHandle(context: GhostSuggestionContext): boolean {
		if (!context.document || !context.range) return false

		const currentLine = context.document.lineAt(context.range.start.line).text
		const previousLine =
			context.range.start.line > 0 && context.document.lineAt(context.range.start.line - 1).text.trim()

		if (isCommentLine(currentLine, context.document.languageId)) {
			return true
		} else if (currentLine.trim() === "" && previousLine) {
			return isCommentLine(previousLine, context.document.languageId)
		} else {
			return false
		}
	}

	getSystemInstructions(): string {
		return (
			getBaseSystemInstructions() +
			`You are an expert code generation assistant that implements code based on comments.

## Core Responsibilities:
1. Read and understand the comment's intent
2. Generate complete, working code that fulfills the comment's requirements
3. Follow the existing code style and patterns
4. Add appropriate error handling
5. Include necessary imports or dependencies

## Code Generation Guidelines:
- Generate only the code that directly implements the comment
- Match the indentation level of the comment
- Use descriptive variable and function names
- Follow language-specific best practices
- Add type annotations where appropriate
- Consider edge cases mentioned in the comment
- If the comment describes multiple steps, implement them all

## Comment Types to Handle:
- TODO comments: Implement the described task
- FIXME comments: Fix the described issue
- Implementation comments: Generate the described functionality
- Algorithm descriptions: Implement the described algorithm
- API/Interface descriptions: Implement the described interface

## Output Requirements:
- Generate ONLY executable code that implements the comment
- PRESERVE all existing code and comments in the provided context
- Do not repeat the comment you are implementing in your output
- Do not add explanatory comments unless necessary for complex logic
- Ensure the code is production-ready
- When using search/replace format, include ALL existing code to preserve it`
		)
	}

	getUserPrompt(context: GhostSuggestionContext): string {
		if (!context.document || !context.range) {
			return "No context available for comment-driven generation."
		}

		const language = context.document.languageId
		const comment = cleanComment(extractComment(context.document, context.range.start.line), language)

		let prompt = `## Comment-Driven Development
- Language: ${language}
- Comment to Implement:
\`\`\`
${comment}
\`\`\`

## Full Code
${formatDocumentWithCursor(context.document, context.range)}

## Instructions
Generate code that implements the functionality described in the comment.
The code should be placed at the cursor position (${CURSOR_MARKER}).
Focus on implementing exactly what the comment describes.
`
		return prompt
	}
}
