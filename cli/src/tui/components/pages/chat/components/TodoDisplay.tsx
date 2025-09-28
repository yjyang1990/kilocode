import React from "react"
import { Box, Text } from "ink"
import { BoxChars } from "../utils/messageIcons.js"
import { truncateText } from "../utils/messageFormatters.js"

interface TodoItem {
	text: string
	status: "pending" | "in_progress" | "completed"
}

interface TodoDisplayProps {
	todos: TodoItem[]
	isExpanded?: boolean
	maxItems?: number
}

export const TodoDisplay: React.FC<TodoDisplayProps> = ({ todos, isExpanded = false, maxItems = 5 }) => {
	if (!todos || todos.length === 0) {
		return null
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return "✅"
			case "in_progress":
				return "🔄"
			case "pending":
			default:
				return "⭕"
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "green"
			case "in_progress":
				return "yellow"
			case "pending":
			default:
				return "gray"
		}
	}

	const displayTodos = isExpanded ? todos : todos.slice(0, maxItems)

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text color="blue" bold>
					📝 Todo List ({todos.filter((t) => t.status === "completed").length}/{todos.length} completed)
				</Text>
			</Box>

			<Box flexDirection="column" paddingLeft={2}>
				{displayTodos.map((todo, index) => (
					<Box key={index} marginBottom={1}>
						<Box flexDirection="row" alignItems="flex-start">
							<Box marginRight={1}>
								<Text color={getStatusColor(todo.status)}>{getStatusIcon(todo.status)}</Text>
							</Box>
							<Box flexGrow={1}>
								<Text color={getStatusColor(todo.status)}>{truncateText(todo.text, 70)}</Text>
							</Box>
						</Box>
					</Box>
				))}

				{!isExpanded && todos.length > maxItems && (
					<Box>
						<Text color="gray" dimColor>
							{BoxChars.vertical} ... and {todos.length - maxItems} more items
						</Text>
					</Box>
				)}
			</Box>
		</Box>
	)
}
