import React, { useState, useEffect, useCallback } from "react"
import { Box, Text } from "ink"
import { ScrollBox } from "@sasaplus1/ink-scroll-box"
import { logService, type LogEntry, type LogLevel, type LogFilter } from "../../../services/LogService.js"
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

	const [scrollOffset, setScrollOffset] = useState(0)

	// Load logs and subscribe to updates
	useEffect(() => {
		const loadLogs = () => {
			const filter: LogFilter = {
				levels: Array.from(logsState.selectedLevels),
			}
			const logs = logService.getLogs(filter).slice(0, logsState.showingCount)
			setLogsState((prev) => ({ ...prev, logs }))
		}

		// Initial load
		loadLogs()

		// Subscribe to new logs
		const unsubscribe = logService.subscribe((newEntry) => {
			if (logsState.selectedLevels.has(newEntry.level)) {
				setLogsState((prev) => ({
					...prev,
					logs: [newEntry, ...prev.logs.slice(0, prev.showingCount - 1)],
				}))
			}
		})

		return unsubscribe
	}, [logsState.selectedLevels, logsState.showingCount])

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
			const logs = logService.getLogs(filter).slice(0, prev.showingCount)

			return {
				...prev,
				selectedLevels: newSelectedLevels,
				logs,
			}
		})
	}, [])

	// Clear all logs
	const clearLogs = useCallback(() => {
		logService.clear()
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
			const logs = logService.getLogs(filter).slice(0, newCount)

			return {
				...prev,
				showingCount: newCount,
				logs,
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
			upArrow: () => {
				if (logsState.logs.length > 0) {
					setScrollOffset((prev) => Math.max(0, prev - 1))
				}
			},
			downArrow: () => {
				if (logsState.logs.length > 0) {
					setScrollOffset((prev) => prev + 1)
				}
			},
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
	const logCounts = logService.getLogCounts()
	const totalLogs = logService.getLogs().length

	// Create header
	const header = <PageHeader title="Logs" />

	// Create filter controls
	const filterControls = (
		<Box
			flexGrow={1}
			flexShrink={0}
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
					icon="📭"
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

	// Create main content with logs
	const content = (
		<Box flexDirection="column" flexGrow={1}>
			{filterControls}
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
				<ScrollBox height="100%" offset={scrollOffset}>
					{logsState.logs.map((log) => (
						<LogRow key={log.id} log={log} formatTimestamp={formatTimestamp} />
					))}
				</ScrollBox>
			</Box>
		</Box>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}

// Helper component for rendering individual log entries
const LogRow: React.FC<{
	log: LogEntry
	formatTimestamp: (timestamp: number) => string
}> = ({ log, formatTimestamp }) => {
	const color = LOG_LEVEL_COLORS[log.level]
	const icon = LOG_LEVEL_ICONS[log.level]

	return (
		<Box flexGrow={0} height={1} overflow="hidden">
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
