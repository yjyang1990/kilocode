import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"
import SelectInput from "ink-select-input"
import type { ExtensionState, WebviewMessage, HistoryItem } from "../../types/messages.js"

interface HistoryViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
}

interface HistoryState {
	tasks: HistoryItem[]
	selectedIndex: number
	isLoading: boolean
}

export const HistoryView: React.FC<HistoryViewProps> = ({ extensionState, sendMessage, onBack }) => {
	const [historyState, setHistoryState] = useState<HistoryState>({
		tasks: [],
		selectedIndex: 0,
		isLoading: true,
	})

	useEffect(() => {
		// Load task history
		const loadHistory = async () => {
			try {
				// Request task history from extension
				await sendMessage({
					type: "taskHistoryRequest",
					payload: {
						requestId: "cli-history-request",
						workspace: "current",
						sort: "newest",
						favoritesOnly: false,
						pageIndex: 0,
					},
				})
			} catch (error) {
				console.error("Failed to load history:", error)
				setHistoryState((prev) => ({ ...prev, isLoading: false }))
			}
		}

		loadHistory()
	}, [sendMessage])

	const handleTaskSelect = async (item: any) => {
		try {
			await sendMessage({
				type: "showTaskWithId",
				text: item.value,
			})
			onBack() // Return to chat view
		} catch (error) {
			console.error("Failed to open task:", error)
		}
	}

	const handleDeleteTask = async (taskId: string) => {
		try {
			await sendMessage({
				type: "deleteTaskWithId",
				text: taskId,
			})
			// Refresh history
			setHistoryState((prev) => ({
				...prev,
				tasks: prev.tasks.filter((task) => task.id !== taskId),
			}))
		} catch (error) {
			console.error("Failed to delete task:", error)
		}
	}

	useInput((input, key) => {
		if (key.escape) {
			onBack()
		} else if (input === "d" && historyState.tasks.length > 0) {
			const selectedTask = historyState.tasks[historyState.selectedIndex]
			if (selectedTask) {
				handleDeleteTask(selectedTask.id)
			}
		}
	})

	if (historyState.isLoading) {
		return (
			<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
				<Text color="blue">📚 Loading task history...</Text>
			</Box>
		)
	}

	if (historyState.tasks.length === 0) {
		return (
			<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
				<Text color="gray">📭 No tasks found</Text>
				<Text color="gray" dimColor>
					Create your first task in the chat view
				</Text>
				<Text color="gray" dimColor>
					Press Esc to go back
				</Text>
			</Box>
		)
	}

	const taskItems = historyState.tasks.map((task) => ({
		label: `${task.task.substring(0, 60)}${task.task.length > 60 ? "..." : ""} (${new Date(task.ts).toLocaleDateString()})`,
		value: task.id,
	}))

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					📚 Task History ({historyState.tasks.length} tasks)
				</Text>
			</Box>

			{/* Task list */}
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
				<SelectInput items={taskItems} onSelect={handleTaskSelect} />
			</Box>

			{/* Footer */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">Enter</Text> to open task, <Text color="red">d</Text> to delete,{" "}
					<Text color="gray">Esc</Text> to go back
				</Text>
			</Box>
		</Box>
	)
}
