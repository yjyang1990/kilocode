import React, { useState, useEffect } from "react"
import { Box, Text } from "ink"
import SelectInput from "ink-select-input"
import { logService } from "../../../services/LogService.js"
import type { HistoryItem } from "../../../types/messages.js"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { EmptyState } from "../generic/EmptyState.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useLoadingState } from "../../hooks/usePageState.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../context/index.js"
import { useParams, useNavigate, useRouter } from "../../router/index.js"

interface HistoryState {
	tasks: HistoryItem[]
	selectedIndex: number
}

export const HistoryView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage, lastMessage: lastExtensionMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const { goBack } = useRouter()
	const [historyState, setHistoryState] = useState<HistoryState>({
		tasks: [],
		selectedIndex: 0,
	})

	const { isLoading, startLoading, stopLoading } = useLoadingState(true)

	useEffect(() => {
		// Load task history
		const loadHistory = async () => {
			try {
				startLoading()
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
				stopLoading()
			}
		}

		loadHistory()
	}, [sendMessage, startLoading, stopLoading])

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
			}))
			stopLoading()
		}
	}, [lastExtensionMessage, stopLoading])

	const handleTaskSelect = async (item: any) => {
		try {
			await sendMessage({
				type: "showTaskWithId",
				text: item.value,
			})
			goBack() // Return to chat view
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

	// Use the new keyboard navigation hook
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			d: () => {
				if (historyState.tasks.length > 0) {
					const selectedTask = historyState.tasks[historyState.selectedIndex]
					if (selectedTask) {
						handleDeleteTask(selectedTask.id)
					}
				}
			},
		},
	})

	// Create header
	const header = <PageHeader title="Task History" badge={`${historyState.tasks.length} tasks`} />

	// Create footer with action hints
	const footer = (
		<PageFooter
			actions={[
				{ key: "Enter", label: "to open task" },
				{ key: "d", label: "to delete", color: "red" },
			]}
		/>
	)

	// Handle loading state
	if (isLoading) {
		return (
			<PageLayout header={header} footer={footer}>
				<EmptyState icon="📂" title="Loading task history..." isLoading={true} />
			</PageLayout>
		)
	}

	// Handle empty state
	if (historyState.tasks.length === 0) {
		return (
			<PageLayout header={header} footer={footer}>
				<EmptyState
					icon="📭"
					title="No tasks found"
					description={["Create your first task in the chat view", "Use the navigation menu to switch views"]}
				/>
			</PageLayout>
		)
	}

	const taskItems = historyState.tasks.map((task) => ({
		label: `${task.task.substring(0, 60)}${task.task.length > 60 ? "..." : ""} (${new Date(task.ts).toLocaleDateString()})`,
		value: task.id,
	}))

	// Create main content
	const content = (
		<Box flexDirection="column" flexGrow={1}>
			{sidebarVisible ? (
				<Box flexDirection="column" paddingX={1} paddingY={1}>
					{taskItems.map((item, index) => (
						<Text key={item.value} color="white">
							{item.label}
						</Text>
					))}
				</Box>
			) : (
				<Box paddingX={1} paddingY={1}>
					<SelectInput items={taskItems} onSelect={handleTaskSelect} />
				</Box>
			)}
		</Box>
	)

	return (
		<PageLayout header={header} footer={footer}>
			{content}
		</PageLayout>
	)
}
