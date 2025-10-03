import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps, CodebaseSearchResult } from "../types.js"
import { getMessageIcon, parseMessageJson } from "../utils.js"

/**
 * Display codebase search results with scores
 */
export const SayCodebaseSearchResultMessage: React.FC<MessageComponentProps> = ({ message }) => {
	const icon = getMessageIcon("say", "codebase_search_result")
	const results = parseMessageJson<CodebaseSearchResult[]>(message.text)

	if (!results || !Array.isArray(results)) {
		return (
			<Box marginY={1}>
				<Text color="cyan" bold>
					{icon} Codebase Search Results (invalid data)
				</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1} marginY={1}>
			<Box>
				<Text color="cyan" bold>
					{icon} Codebase Search Results
				</Text>
			</Box>

			<Box marginTop={1}>
				<Text color="gray" dimColor>
					Found {results.length} result{results.length !== 1 ? "s" : ""}
				</Text>
			</Box>

			{results.slice(0, 5).map((result, index) => (
				<Box key={index} flexDirection="column" marginTop={1} marginLeft={1}>
					<Box>
						<Text color="white" bold>
							{index + 1}. {result.file}:{result.line}
						</Text>
					</Box>
					<Box marginLeft={2}>
						<Text color="gray">{result.content.substring(0, 80)}</Text>
					</Box>
					<Box marginLeft={2}>
						<Text color="cyan" dimColor>
							Score: {result.score.toFixed(2)}
						</Text>
					</Box>
				</Box>
			))}

			{results.length > 5 && (
				<Box marginTop={1}>
					<Text color="gray" dimColor>
						... and {results.length - 5} more result{results.length - 5 !== 1 ? "s" : ""}
					</Text>
				</Box>
			)}
		</Box>
	)
}
