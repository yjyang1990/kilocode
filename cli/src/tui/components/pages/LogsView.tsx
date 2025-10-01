import React, { useState, useEffect, useCallback } from "react"
import { Box } from "ink"
import { Text } from "../common/Text.js"
import { ScrollArea, useScrollArea } from "../common/ScrollArea.js"
import { logs, type LogEntry, type LogLevel, type LogFilter } from "../../../services/logs.js"
import { PageHeader } from "../generic/PageHeader.js"
import { EmptyState } from "../generic/EmptyState.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../context/index.js"
import { useRouter } from "../../router/index.js"
import {
	LOG_LEVEL_COLORS,
	LOG_LEVEL_ICONS,
	LOG_LEVELS,
	DEFAULT_LOG_LEVELS,
	UI_CONSTANTS,
} from "../../../constants/index.js"

interface LogsState {
	logs: LogEntry[]
	filter: LogFilter
	selectedLevels: Set<LogLevel>
	autoScroll: boolean
	showingCount: number
}

export const LogsView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const { goBack } = useRouter()
	const [logsState, setLogsState] = useState<LogsState>({
		logs: [],
		filter: {},
		selectedLevels: DEFAULT_LOG_LEVELS,
		autoScroll: true,
		showingCount: UI_CONSTANTS.DEFAULT_LOG_COUNT,
	})

	// Use the scroll area hook for managing scroll state
	const { scrollTop, isAtBottom, scrollToBottom, scrollToTop, onScrollChange } = useScrollArea()

	// Load logs and subscribe to updates
	useEffect(() => {
		const loadLogs = () => {
			const filter: LogFilter = {
				levels: Array.from(logsState.selectedLevels),
			}
			// Get logs and reverse them so oldest are first (will display at top)
			const logsItems = logs.getLogs(filter).slice(0, logsState.showingCount).reverse()
			setLogsState((prev) => ({ ...prev, logs: logsItems }))
		}

		// Initial load
		loadLogs()

		// Subscribe to new logs
		const unsubscribe = logs.subscribe((newEntry) => {
			if (logsState.selectedLevels.has(newEntry.level)) {
				setLogsState((prev) => ({
					...prev,
					// Add new log at the end (bottom) and remove oldest if exceeding limit
					logs: [...prev.logs.slice(-(prev.showingCount - 1)), newEntry],
				}))
				// Auto-scroll to bottom when new log arrives (logs are shown oldest first, newest at bottom)
				if (logsState.autoScroll) {
					scrollToBottom()
				}
			}
		})

		return unsubscribe
	}, [logsState.selectedLevels, logsState.showingCount, logsState.autoScroll, scrollToBottom])

	// Auto-scroll to bottom on initial load when autoScroll is enabled
	useEffect(() => {
		if (logsState.autoScroll && logsState.logs.length > 0) {
			// Small delay to ensure content is rendered
			const timer = setTimeout(() => {
				scrollToBottom()
			}, 50)
			return () => clearTimeout(timer)
		}
		return undefined
	}, [logsState.logs.length > 0, logsState.autoScroll, scrollToBottom])

	// Toggle log level filter
	const toggleLogLevel = useCallback((level: LogLevel) => {
		setLogsState((prev) => {
			const newSelectedLevels = new Set(prev.selectedLevels)
			if (newSelectedLevels.has(level)) {
				newSelectedLevels.delete(level)
			} else {
				newSelectedLevels.add(level)
			}

			// Reload logs with new filter
			const filter: LogFilter = {
				levels: Array.from(newSelectedLevels),
			}
			// Get logs and reverse them so oldest are first
			const logsItems = logs.getLogs(filter).slice(0, prev.showingCount).reverse()

			return {
				...prev,
				selectedLevels: newSelectedLevels,
				logs: logsItems,
			}
		})
	}, [])

	// Clear all logs
	const clearLogs = useCallback(() => {
		logs.clear()
		setLogsState((prev) => ({ ...prev, logs: [] }))
	}, [])

	// Increase/decrease showing count
	const adjustShowingCount = useCallback((delta: number) => {
		setLogsState((prev) => {
			const newCount = Math.max(
				UI_CONSTANTS.LOG_COUNT_MIN,
				Math.min(UI_CONSTANTS.LOG_COUNT_MAX, prev.showingCount + delta),
			)
			const filter: LogFilter = {
				levels: Array.from(prev.selectedLevels),
			}
			// Get logs and reverse them so oldest are first
			const logsItems = logs.getLogs(filter).slice(0, newCount).reverse()

			return {
				...prev,
				showingCount: newCount,
				logs: logsItems,
			}
		})
	}, [])

	// Use the new keyboard navigation hook
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			c: () => clearLogs(),
			i: () => toggleLogLevel("info"),
			d: () => toggleLogLevel("debug"),
			w: () => toggleLogLevel("warn"),
			e: () => toggleLogLevel("error"),
			"+": () => adjustShowingCount(UI_CONSTANTS.LOG_COUNT_STEP),
			"-": () => adjustShowingCount(-UI_CONSTANTS.LOG_COUNT_STEP),
			// Arrow keys are now handled by ScrollArea component
			"ctrl+e": () => scrollToBottom(),
			"ctrl+a": () => scrollToTop(),
		},
	})

	// Format timestamp for display
	const formatTimestamp = (timestamp: number): string => {
		const date = new Date(timestamp)
		return date.toLocaleTimeString("en-US", {
			hour12: false,
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			fractionalSecondDigits: 3,
		})
	}

	// Get log counts for display
	const logCounts = logs.getLogCounts()
	const totalLogs = logs.getLogs().length

	// Create header
	const header = <PageHeader title="Logs" />

	// Create filter controls
	const filterControls = (
		<Box
			flexShrink={0}
			height={3}
			borderStyle="single"
			borderColor="gray"
			paddingX={1}
			justifyContent="space-between">
			<Box gap={1}>
				<Text color="gray" bold>
					Filters:
				</Text>
				{LOG_LEVELS.map((level) => (
					<Text key={level}>
						<Text color={logsState.selectedLevels.has(level) ? LOG_LEVEL_COLORS[level] : "gray"}>
							{LOG_LEVEL_ICONS[level]} {level.toUpperCase()}
						</Text>
						<Text color="gray" dimColor>
							({logCounts[level]})
						</Text>
					</Text>
				))}
			</Box>
			<Box gap={1}>
				<Text color="gray" dimColor>
					<Text color="blue">[i]</Text>nfo <Text color="yellow">[d]</Text>ebug{" "}
					<Text color="magenta">[w]</Text>arn <Text color="red">[e]</Text>rror <Text color="green">[c]</Text>
					lear <Text color="cyan">[+/-]</Text>count
				</Text>
			</Box>
		</Box>
	)

	// Handle empty state
	if (logsState.logs.length === 0) {
		return (
			<PageLayout header={header}>
				{filterControls}
				<EmptyState
					title="No logs to display"
					description={
						logsState.selectedLevels.size === 0
							? "All log levels are filtered out"
							: "No logs match the current filter"
					}
				/>
			</PageLayout>
		)
	}

	const content = (
		<Box flexDirection="column" flexGrow={1} overflow="hidden">
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1} overflow="hidden">
				<ScrollArea
					height="100%"
					autoScroll={logsState.autoScroll}
					scrollSpeed={3}
					onScrollChange={onScrollChange}
					showBorder={false}
					isActive={true}
					isFocused={true}>
					{logsState.logs.map((log) => (
						<LogRow key={log.id} log={log} formatTimestamp={formatTimestamp} />
					))}
				</ScrollArea>
			</Box>
		</Box>
	)

	return (
		<PageLayout header={header}>
			{filterControls}
			{content}
		</PageLayout>
	)
}

// Helper component for rendering individual log entries
const LogRow: React.FC<{
	log: LogEntry
	formatTimestamp: (timestamp: number) => string
}> = ({ log, formatTimestamp }) => {
	const color = LOG_LEVEL_COLORS[log.level]
	const icon = LOG_LEVEL_ICONS[log.level]

	return (
		<Box height={1} minHeight={1} flexShrink={0}>
			<Box marginRight={1} minWidth={12}>
				<Text color="gray" dimColor>
					{formatTimestamp(log.timestamp)}
				</Text>
			</Box>
			<Box marginRight={1} minWidth={2}>
				<Text color={color}>{icon}</Text>
			</Box>
			<Box marginRight={1} minWidth={8}>
				<Text color={color} bold>
					{log.level.toUpperCase()}
				</Text>
			</Box>
			{log.source && (
				<Box marginRight={1} minWidth={15}>
					<Text color="cyan" dimColor>
						[{log.source}]
					</Text>
				</Box>
			)}
			<Box flexGrow={1}>
				<Text color="white">{log.message}</Text>
				{log.context && (
					<Text color="gray" dimColor>
						{" "}
						{JSON.stringify(log.context)}
					</Text>
				)}
			</Box>
		</Box>
	)
}
