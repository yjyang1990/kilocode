import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"
import SelectInput from "ink-select-input"
import { logService } from "../../services/LogService.js"
import type { ExtensionState, WebviewMessage, HistoryItem } from "../../types/messages.js"

interface HistoryViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
	lastExtensionMessage?: any
	sidebarVisible?: boolean
}

interface HistoryState {
	tasks: HistoryItem[]
	selectedIndex: number
	isLoading: boolean
}

export const HistoryView: React.FC<HistoryViewProps> = ({
	extensionState,
	sendMessage,
	onBack,
	lastExtensionMessage,
	sidebarVisible = false,
}) => {
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
				logService.error("Failed to load history", "HistoryView", { error })
				setHistoryState((prev) => ({ ...prev, isLoading: false }))
			}
		}

		loadHistory()
	}, [sendMessage])

	// Listen for extension messages, specifically taskHistoryResponse
	useEffect(() => {
		if (
			lastExtensionMessage &&
			lastExtensionMessage.type === "taskHistoryResponse" &&
			lastExtensionMessage.payload
		) {
			logService.debug("Received taskHistoryResponse in HistoryView", "HistoryView", {
				payload: lastExtensionMessage.payload,
			})

			// Update history state with the received data
			setHistoryState((prev) => ({
				...prev,
				tasks: lastExtensionMessage.payload.historyItems || [],
				isLoading: false,
			}))
		}
	}, [lastExtensionMessage])

	const handleTaskSelect = async (item: any) => {
		try {
			await sendMessage({
				type: "showTaskWithId",
				text: item.value,
			})
			onBack() // Return to chat view
		} catch (error) {
			logService.error("Failed to open task", "HistoryView", { error })
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
			logService.error("Failed to delete task", "HistoryView", { error })
		}
	}

	useInput((input, key) => {
		// Don't handle input when sidebar is visible
		if (sidebarVisible) return

		if (input === "d" && historyState.tasks.length > 0) {
			const selectedTask = historyState.tasks[historyState.selectedIndex]
			if (selectedTask) {
				handleDeleteTask(selectedTask.id)
			}
		}
	})

	if (historyState.isLoading) {
		return (
			<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
				<Text color="blue">Loading task history...</Text>
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
					Use the navigation menu to switch views
				</Text>
			</Box>
		)
	}

	const taskItems = historyState.tasks.map((task) => ({
		label: `${task.task.substring(0, 60)}${task.task.length > 60 ? "..." : ""} (${new Date(task.ts).toLocaleDateString()})`,
		value: task.id,
	}))

	return (
		<Box flexDirection="column" height="100%" paddingX={1} paddingY={1}>
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					Task History ({historyState.tasks.length} tasks)
				</Text>
			</Box>

			{/* Task list */}
			<Box flexDirection="column" flexGrow={1}>
				{sidebarVisible ? (
					<Box flexDirection="column">
						{taskItems.map((item, index) => (
							<Text key={item.value} color="white">
								{item.label}
							</Text>
						))}
					</Box>
				) : (
					<SelectInput items={taskItems} onSelect={handleTaskSelect} />
				)}
			</Box>

			{/* Footer */}
			<Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">Enter</Text> to open task, <Text color="red">d</Text> to delete
				</Text>
			</Box>
		</Box>
	)
}
