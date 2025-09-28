import React from "react"
import { Box, Text } from "ink"
import type { ClineMessage } from "../../../../../types/messages.js"
import { MessageIcons, BoxChars } from "../utils/messageIcons.js"
import { parseToolInfo, formatFilePath, truncateText } from "../utils/messageFormatters.js"

interface ToolDisplayProps {
	message: ClineMessage
	isExpanded?: boolean
}

export const ToolDisplay: React.FC<ToolDisplayProps> = ({ message, isExpanded = false }) => {
	const toolInfo = parseToolInfo(message.text)

	if (!toolInfo) {
		return (
			<Box>
				<Text color="yellow">Tool request (parsing failed)</Text>
			</Box>
		)
	}

	const renderToolContent = () => {
		switch (toolInfo.tool) {
			case "editedExistingFile":
			case "appliedDiff":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="yellow">
								{MessageIcons.edit} {toolInfo.isProtected ? "🔒 " : ""}
								{toolInfo.isOutsideWorkspace ? "📤 " : ""}
								Edit file: {formatFilePath(toolInfo.path)}
							</Text>
						</Box>
						{isExpanded && toolInfo.diff && (
							<Box marginTop={1} paddingLeft={2}>
								<Text color="gray">{BoxChars.vertical} Diff preview:</Text>
								<Box marginTop={1}>
									<Text>{truncateText(toolInfo.diff, 200)}</Text>
								</Box>
							</Box>
						)}
					</Box>
				)

			case "newFileCreated":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="green">
								{MessageIcons.create} {toolInfo.isProtected ? "🔒 " : ""}
								Create file: {formatFilePath(toolInfo.path)}
							</Text>
						</Box>
						{isExpanded && toolInfo.content && (
							<Box marginTop={1} paddingLeft={2}>
								<Text color="gray">{BoxChars.vertical} Content preview:</Text>
								<Box marginTop={1}>
									<Text>{truncateText(toolInfo.content, 200)}</Text>
								</Box>
							</Box>
						)}
					</Box>
				)

			case "readFile":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="blue">
								{MessageIcons.file} {toolInfo.isOutsideWorkspace ? "📤 " : ""}
								Read file: {formatFilePath(toolInfo.path)}
							</Text>
						</Box>
						{toolInfo.additionalFileCount && toolInfo.additionalFileCount > 0 && (
							<Box marginTop={1}>
								<Text color="gray">+ {toolInfo.additionalFileCount} more files</Text>
							</Box>
						)}
					</Box>
				)

			case "listFilesTopLevel":
			case "listFilesRecursive":
				return (
					<Box>
						<Text color="cyan">
							{MessageIcons.folder} {toolInfo.isOutsideWorkspace ? "📤 " : ""}
							List {toolInfo.tool === "listFilesRecursive" ? "recursive" : "top-level"}:{" "}
							{formatFilePath(toolInfo.path || ".")}
						</Text>
					</Box>
				)

			case "searchFiles":
				return (
					<Box>
						<Text color="magenta">
							{MessageIcons.search} {toolInfo.isOutsideWorkspace ? "📤 " : ""}
							Search: "{toolInfo.regex}" in {formatFilePath(toolInfo.path || ".")}
						</Text>
					</Box>
				)

			case "listCodeDefinitionNames":
				return (
					<Box>
						<Text color="cyan">
							{MessageIcons.search} {toolInfo.isOutsideWorkspace ? "📤 " : ""}
							List definitions: {formatFilePath(toolInfo.path || ".")}
						</Text>
					</Box>
				)

			case "insertContent":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="yellow">
								{MessageIcons.create} {toolInfo.isProtected ? "🔒 " : ""}
								Insert at line {toolInfo.lineNumber || "end"}: {formatFilePath(toolInfo.path)}
							</Text>
						</Box>
						{isExpanded && toolInfo.content && (
							<Box marginTop={1} paddingLeft={2}>
								<Text color="gray">{BoxChars.vertical} Content:</Text>
								<Box marginTop={1}>
									<Text>{truncateText(toolInfo.content, 200)}</Text>
								</Box>
							</Box>
						)}
					</Box>
				)

			case "searchAndReplace":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="yellow">
								{MessageIcons.edit} {toolInfo.isProtected ? "🔒 " : ""}
								Search & Replace: {formatFilePath(toolInfo.path)}
							</Text>
						</Box>
						{isExpanded && (
							<Box marginTop={1} paddingLeft={2}>
								<Text color="gray">
									{BoxChars.vertical} Pattern: {truncateText(toolInfo.search || "", 50)}
								</Text>
								<Text color="gray">
									{BoxChars.vertical} Replace: {truncateText(toolInfo.replace || "", 50)}
								</Text>
							</Box>
						)}
					</Box>
				)

			case "switchMode":
				return (
					<Box>
						<Text color="magenta">
							🔄 Switch to mode: <Text bold>{toolInfo.mode}</Text>
							{toolInfo.reason && <Text color="gray"> - {toolInfo.reason}</Text>}
						</Text>
					</Box>
				)

			case "newTask":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="green">
								📋 Create subtask in mode: <Text bold>{toolInfo.mode}</Text>
							</Text>
						</Box>
						{isExpanded && toolInfo.content && (
							<Box marginTop={1} paddingLeft={2} borderStyle="single" borderColor="gray">
								<Text>{truncateText(toolInfo.content, 300)}</Text>
							</Box>
						)}
					</Box>
				)

			case "finishTask":
				return (
					<Box>
						<Text color="green">✅ Finish current subtask</Text>
					</Box>
				)

			case "updateTodoList":
				return (
					<Box flexDirection="column">
						<Box>
							<Text color="blue">📝 Update todo list</Text>
						</Box>
						{isExpanded && toolInfo.todos && Array.isArray(toolInfo.todos) && (
							<Box marginTop={1} paddingLeft={2}>
								{toolInfo.todos.slice(0, 5).map((todo: any, index: number) => (
									<Box key={index}>
										<Text color="gray">
											{todo.status === "completed"
												? "✅"
												: todo.status === "in_progress"
													? "🔄"
													: "⭕"}{" "}
											{truncateText(todo.text, 60)}
										</Text>
									</Box>
								))}
								{toolInfo.todos.length > 5 && (
									<Text color="gray">... and {toolInfo.todos.length - 5} more</Text>
								)}
							</Box>
						)}
					</Box>
				)

			case "generateImage":
				return (
					<Box>
						<Text color="magenta">
							🎨 {toolInfo.isProtected ? "🔒 " : ""}
							Generate image: {formatFilePath(toolInfo.path)}
						</Text>
					</Box>
				)

			default:
				return (
					<Box>
						<Text color="yellow">
							{MessageIcons.default} Tool: {toolInfo.tool}
						</Text>
					</Box>
				)
		}
	}

	return <Box flexDirection="column">{renderToolContent()}</Box>
}
