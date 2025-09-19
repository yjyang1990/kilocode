import React from "react"
import { Box, Text } from "ink"
import type { ExtensionState } from "../../types/messages.js"

interface StatusBarProps {
	extensionState: ExtensionState | null
	workspace: string
}

export const StatusBar: React.FC<StatusBarProps> = ({ extensionState, workspace }) => {
	const currentMode = extensionState?.mode || "code"
	const apiProvider = extensionState?.apiConfiguration?.apiProvider || "unknown"
	const taskCount = extensionState?.taskHistoryFullLength || 0

	return (
		<Box borderStyle="single" borderColor="gray" paddingX={1}>
			<Box gap={2}>
				<Text color="green">📁 {workspace.split("/").pop()}</Text>
				<Text color="blue">🎭 {currentMode}</Text>
				<Text color="yellow">🤖 {apiProvider}</Text>
				<Text color="cyan">📊 {taskCount} tasks</Text>
			</Box>
			<Box marginLeft={1}>
				<Text color="gray" dimColor>
					Kilo Code CLI v1.0.0
				</Text>
			</Box>
		</Box>
	)
}
