import React, { useState, useEffect, useCallback } from "react"
import { Box, Text, useInput } from "ink"
import type { ExtensionState, WebviewMessage } from "../../types/messages.js"
import { logService, type LogEntry, type LogLevel, type LogFilter } from "../../services/LogService.js"

interface LogsViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
}

interface LogsState {
	logs: LogEntry[]
	filter: LogFilter
	selectedLevels: Set<LogLevel>
	autoScroll: boolean
	showingCount: number
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
	info: "blue",
	debug: "yellow",
	warn: "magenta",
	error: "red",
}

const LOG_LEVEL_ICONS: Record<LogLevel, string> = {
	info: "🔵",
	debug: "🟡",
	warn: "🟠",
	error: "🔴",
}

export const LogsView: React.FC<LogsViewProps> = ({ extensionState, sendMessage, onBack }) => {
	const [logsState, setLogsState] = useState<LogsState>({
		logs: [],
		filter: {},
		selectedLevels: new Set(["info", "debug", "warn", "error"]),
		autoScroll: true,
		showingCount: 50, // Show last 50 logs by default
	})

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
			const newCount = Math.max(10, Math.min(500, prev.showingCount + delta))
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

	// Handle keyboard input
	useInput((input, key) => {
		if (key.escape) {
			onBack()
		} else if (input === "c") {
			clearLogs()
		} else if (input === "i") {
			toggleLogLevel("info")
		} else if (input === "d") {
			toggleLogLevel("debug")
		} else if (input === "w") {
			toggleLogLevel("warn")
		} else if (input === "e") {
			toggleLogLevel("error")
		} else if (input === "+") {
			adjustShowingCount(25)
		} else if (input === "-") {
			adjustShowingCount(-25)
		}
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

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					🗒️ Logs ({logsState.logs.length}/{totalLogs} entries)
				</Text>
			</Box>

			{/* Filter controls */}
			<Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
				<Box gap={1}>
					<Text color="gray">Filters:</Text>
					{(["info", "debug", "warn", "error"] as LogLevel[]).map((level) => (
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
				<Text color="gray" dimColor>
					Showing: {logsState.showingCount}
				</Text>
			</Box>

			{/* Logs area */}
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
				{logsState.logs.length === 0 ? (
					<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
						<Text color="gray">📭 No logs to display</Text>
						<Text color="gray" dimColor>
							{logsState.selectedLevels.size === 0
								? "All log levels are filtered out"
								: "No logs match the current filter"}
						</Text>
					</Box>
				) : (
					<Box flexDirection="column">
						{logsState.logs.map((log) => (
							<LogRow key={log.id} log={log} formatTimestamp={formatTimestamp} />
						))}
					</Box>
				)}
			</Box>

			{/* Footer with controls */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">[i]</Text>nfo <Text color="yellow">[d]</Text>ebug{" "}
					<Text color="magenta">[w]</Text>arn <Text color="red">[e]</Text>rror <Text color="green">[c]</Text>
					lear <Text color="cyan">[+/-]</Text>count <Text color="gray">[Esc]</Text> back
				</Text>
			</Box>
		</Box>
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
		<Box marginBottom={1}>
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
