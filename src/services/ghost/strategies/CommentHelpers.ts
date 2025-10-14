import { TextDocument } from "vscode"

/**
 * Checks if a line is a comment based on language
 */
export function isCommentLine(line: string, languageId: string): boolean {
	const trimmed = line.trim()

	// Common single-line comment patterns
	const singleLinePatterns = [
		/^\/\//, // JavaScript, TypeScript, C++, Java, etc.
		/^#/, // Python, Ruby, Shell, etc.
		/^--/, // SQL, Haskell, Lua
		/^;/, // Assembly, Lisp
		/^%/, // MATLAB, LaTeX
		/^'/, // VB
	]

	// Multi-line comment patterns
	const multiLinePatterns = [
		/^\/\*/, // C-style
		/^\*/, // Inside C-style block
		/^<!--/, // HTML, XML
		/^"""/, // Python docstring
		/^'''/, // Python docstring alternative
	]

	// Language-specific exclusions
	if (languageId === "css" || languageId === "scss" || languageId === "less") {
		// CSS only supports /* */ comments, not //
		return /^(\/\*|\*)/.test(trimmed)
	}

	if (languageId === "html" || languageId === "xml") {
		// HTML/XML only supports <!-- --> comments
		return /^<!--/.test(trimmed)
	}

	// Check single-line patterns
	if (singleLinePatterns.some((pattern) => pattern.test(trimmed))) {
		// Make sure it contains meaningful text (not just comment syntax)
		const withoutCommentSyntax = trimmed.replace(/^(\/\/|#|--|;|%|')\s*/, "")
		return withoutCommentSyntax.length > 0
	}

	// Check multi-line patterns
	if (multiLinePatterns.some((pattern) => pattern.test(trimmed))) {
		return true
	}

	return false
}

export function extractComment(document: TextDocument, currentLine: number): string {
	let comment = ""

	// Get the comment (could be multi-line)
	let commentStartLine = currentLine
	let commentEndLine = currentLine

	// Check if current line is a comment
	const currentLineText = document.lineAt(currentLine).text
	if (isCommentLine(currentLineText.trim(), document.languageId)) {
		comment = currentLineText.trim()

		// Check for multi-line comments above
		let line = currentLine - 1
		while (line >= 0) {
			const lineText = document.lineAt(line).text.trim()
			if (isCommentLine(lineText, document.languageId)) {
				comment = lineText + "\n" + comment
				commentStartLine = line
				line--
			} else {
				break
			}
		}

		// Check for multi-line comments below
		line = currentLine + 1
		while (line < document.lineCount) {
			const lineText = document.lineAt(line).text.trim()
			if (isCommentLine(lineText, document.languageId)) {
				comment = comment + "\n" + lineText
				commentEndLine = line
				line++
			} else {
				break
			}
		}
	} else if (currentLine > 0) {
		// Check previous line for comment
		const prevLineText = document.lineAt(currentLine - 1).text
		if (isCommentLine(prevLineText.trim(), document.languageId)) {
			comment = prevLineText.trim()
			commentStartLine = currentLine - 1
			commentEndLine = currentLine - 1
		}
	}

	return comment
}

/**
 * Cleans comment text by removing comment syntax
 */
export function cleanComment(comment: string, languageId: string): string {
	const lines = comment.split("\n")
	const cleaned = lines.map((line) => {
		let cleaned = line.trim()

		// Remove common comment prefixes (order matters)
		cleaned = cleaned
			.replace(/^\/\/\s*/, "") // //
			.replace(/^\/\*\s*/, "") // /*
			.replace(/^\*\s+/, "") // * with required space after
			.replace(/^#\s*/, "") // #
			.replace(/^--\s*/, "") // --
			.replace(/^;\s*/, "") // ;
			.replace(/^%\s*/, "") // %
			.replace(/^'\s*/, "") // '
			.replace(/^<!--\s*/, "") // <!--

		// Remove trailing comment syntax and everything after the last occurrence
		const lastCommentEnd = cleaned.lastIndexOf("*/")
		if (lastCommentEnd !== -1) {
			cleaned = cleaned.substring(0, lastCommentEnd).trim()
		}

		const lastHtmlCommentEnd = cleaned.lastIndexOf("-->")
		if (lastHtmlCommentEnd !== -1) {
			cleaned = cleaned.substring(0, lastHtmlCommentEnd).trim()
		}

		return cleaned.trim()
	})

	return cleaned.filter((line) => line.length > 0).join("\n")
}
