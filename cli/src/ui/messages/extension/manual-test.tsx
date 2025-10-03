/**
 * Manual Test Script for ExtensionMessageRow
 *
 * This script renders various message types to visually verify they display correctly.
 * Run with: npx tsx cli/src/ui/messages/extension/manual-test.tsx
 */

import React from "react"
import { render, Box, Text } from "ink"
import { ExtensionMessageRow } from "./ExtensionMessageRow.js"
import type { ExtensionChatMessage } from "../../../types/messages.js"

// Sample messages for testing
const testMessages: ExtensionChatMessage[] = [
	// Say Text Message
	{
		ts: Date.now(),
		type: "say",
		say: "text",
		text: "This is a plain text message from the assistant.",
	},

	// Say Error Message
	{
		ts: Date.now() + 1,
		type: "say",
		say: "error",
		text: "An error occurred while processing your request.",
	},

	// Say Text with Images
	{
		ts: Date.now() + 2,
		type: "say",
		say: "text",
		text: "Here's a message with attached images.",
		images: ["screenshot1.png", "diagram.svg"],
	},

	// Say Partial Message
	{
		ts: Date.now() + 3,
		type: "say",
		say: "text",
		text: "This is a streaming message that's still being generated",
		partial: true,
	},

	// Ask Tool Message - Read File
	{
		ts: Date.now() + 4,
		type: "ask",
		ask: "tool",
		text: JSON.stringify({
			tool: "readFile",
			path: "src/components/App.tsx",
		}),
	},

	// Ask Tool Message - Write File
	{
		ts: Date.now() + 5,
		type: "ask",
		ask: "tool",
		text: JSON.stringify({
			tool: "editedExistingFile",
			path: "src/utils/helper.ts",
			content: "export function helper() { return 'updated'; }",
		}),
	},

	// Ask Command Message
	{
		ts: Date.now() + 6,
		type: "ask",
		ask: "command",
		text: "npm install react-query",
	},

	// Ask Followup Message
	{
		ts: Date.now() + 7,
		type: "ask",
		ask: "followup",
		text: JSON.stringify({
			question: "What would you like to do next?",
			suggest: [{ text: "Continue with implementation" }, { text: "Review the changes" }, { text: "Run tests" }],
		}),
	},

	// Ask Completion Result
	{
		ts: Date.now() + 8,
		type: "ask",
		ask: "completion_result",
		text: "I've successfully completed the task. The component has been refactored and all tests are passing.",
	},

	// Say API Request Started
	{
		ts: Date.now() + 9,
		type: "say",
		say: "api_req_started",
		text: JSON.stringify({
			request: "Sending request to Claude API...",
		}),
	},

	// Say Completion Result
	{
		ts: Date.now() + 10,
		type: "say",
		say: "completion_result",
		text: "Task completed successfully!",
	},

	// Ask MCP Server
	{
		ts: Date.now() + 11,
		type: "ask",
		ask: "use_mcp_server",
		text: JSON.stringify({
			type: "use_mcp_tool",
			serverName: "filesystem",
			toolName: "read_file",
			arguments: JSON.stringify({ path: "/tmp/test.txt" }),
		}),
	},

	// Say Tool Message
	{
		ts: Date.now() + 12,
		type: "say",
		say: "tool",
		text: JSON.stringify({
			tool: "newFileCreated",
			path: "src/components/NewComponent.tsx",
			content: "export const NewComponent = () => { return <div>Hello</div>; }",
		}),
	},

	// Unknown Ask Type
	{
		ts: Date.now() + 13,
		type: "ask",
		ask: "unknown_type" as any,
		text: "This is an unknown ask type for testing fallback behavior.",
	},

	// Unknown Say Type
	{
		ts: Date.now() + 14,
		type: "say",
		say: "unknown_type" as any,
		text: "This is an unknown say type for testing fallback behavior.",
	},

	// Unknown Message Type
	{
		ts: Date.now() + 15,
		type: "unknown" as any,
		text: "This is a completely unknown message type.",
	},
]

// Component to render all test messages
const ManualTest: React.FC = () => {
	return (
		<Box flexDirection="column" padding={1}>
			<Box borderStyle="double" borderColor="cyan" paddingX={2} marginBottom={1}>
				<Text bold color="cyan">
					ExtensionMessageRow Manual Test Suite
				</Text>
			</Box>

			<Box flexDirection="column">
				{testMessages.map((message, index) => (
					<Box key={index} flexDirection="column" marginBottom={1}>
						<Box borderStyle="single" borderColor="gray" paddingX={1}>
							<Text dimColor>
								Test {index + 1}: {message.type} - {message.ask || message.say || "unknown"}
							</Text>
						</Box>
						<ExtensionMessageRow message={message} />
					</Box>
				))}
			</Box>

			<Box borderStyle="double" borderColor="green" paddingX={2} marginTop={1}>
				<Text bold color="green">
					✓ All {testMessages.length} message types rendered
				</Text>
			</Box>
		</Box>
	)
}

// Render the test suite
const { unmount } = render(<ManualTest />)

// Keep the process running for a few seconds to view the output
setTimeout(() => {
	unmount()
	process.exit(0)
}, 10000)
