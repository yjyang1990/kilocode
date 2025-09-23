export type LogLevel = "info" | "debug" | "error" | "warn"

export interface LogEntry {
	id: string
	timestamp: number
	level: LogLevel
	message: string
	source?: string
	context?: Record<string, any>
}

export interface LogFilter {
	levels?: LogLevel[]
	source?: string
	since?: number
}

/**
 * Singleton service for managing application logs with enhanced metadata
 */
export class LogService {
	private static instance: LogService | null = null
	private logs: LogEntry[] = []
	private maxEntries: number = 1000
	private listeners: Array<(entry: LogEntry) => void> = []
	private originalConsole: {
		log: typeof console.log
		error: typeof console.error
		warn: typeof console.warn
		debug: typeof console.debug
		info: typeof console.info
	} | null = null

	private constructor() {
		// Private constructor for singleton pattern
		// Store original console methods before any interception
		this.originalConsole = {
			log: console.log,
			error: console.error,
			warn: console.warn,
			debug: console.debug,
			info: console.info,
		}
	}

	/**
	 * Get the singleton instance of LogService
	 */
	public static getInstance(): LogService {
		if (!LogService.instance) {
			LogService.instance = new LogService()
		}
		return LogService.instance
	}

	/**
	 * Add a log entry with the specified level
	 */
	private addLog(level: LogLevel, message: string, source?: string, context?: Record<string, any>): void {
		const entry: LogEntry = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			timestamp: Date.now(),
			level,
			message,
			...(source && { source }),
			...(context && { context }),
		}

		// Add to logs array
		this.logs.unshift(entry) // Add to beginning for newest-first order

		// Maintain max entries limit
		if (this.logs.length > this.maxEntries) {
			this.logs = this.logs.slice(0, this.maxEntries)
		}

		// Notify listeners
		this.listeners.forEach((listener) => listener(entry))

		// Also output to console for development
		// this.outputToConsole(entry)
	}

	/**
	 * Output log entry to console with appropriate formatting
	 * Uses original console methods to avoid circular dependency
	 */
	private outputToConsole(entry: LogEntry): void {
		// GUARD: Prevent recursive logging by checking if we're already in a logging call
		if ((this as any)._isLogging) {
			return
		}

		// Use original console methods to prevent circular dependency
		if (!this.originalConsole) {
			// Fallback: if original console not available, skip console output
			return
		}

		// Set flag to prevent recursion
		;(this as any)._isLogging = true

		try {
			const timestamp = new Date(entry.timestamp).toISOString()
			const source = entry.source ? `[${entry.source}]` : ""
			const prefix = `${timestamp} ${source}`

			// DIAGNOSTIC: Check if our "original" console methods are actually original
			const isOriginalConsole = this.originalConsole.error.toString().includes("[native code]")
			if (!isOriginalConsole) {
				// Our "original" console is actually intercepted - skip to prevent loop
				return
			}

			switch (entry.level) {
				case "error":
					this.originalConsole.error(`${prefix} ERROR:`, entry.message, entry.context || "")
					break
				case "warn":
					this.originalConsole.warn(`${prefix} WARN:`, entry.message, entry.context || "")
					break
				case "debug":
					this.originalConsole.debug(`${prefix} DEBUG:`, entry.message, entry.context || "")
					break
				case "info":
				default:
					this.originalConsole.log(`${prefix} INFO:`, entry.message, entry.context || "")
					break
			}
		} finally {
			// Always clear the flag
			;(this as any)._isLogging = false
		}
	}

	/**
	 * Log an info message
	 */
	public info(message: string, source?: string, context?: Record<string, any>): void {
		this.addLog("info", message, source, context)
	}

	/**
	 * Log a debug message
	 */
	public debug(message: string, source?: string, context?: Record<string, any>): void {
		this.addLog("debug", message, source, context)
	}

	/**
	 * Log an error message
	 */
	public error(message: string, source?: string, context?: Record<string, any>): void {
		this.addLog("error", message, source, context)
	}

	/**
	 * Log a warning message
	 */
	public warn(message: string, source?: string, context?: Record<string, any>): void {
		this.addLog("warn", message, source, context)
	}

	/**
	 * Get all logs with optional filtering
	 */
	public getLogs(filter?: LogFilter): LogEntry[] {
		let filteredLogs = [...this.logs]

		if (filter) {
			if (filter.levels && filter.levels.length > 0) {
				filteredLogs = filteredLogs.filter((log) => filter.levels!.includes(log.level))
			}

			if (filter.source) {
				filteredLogs = filteredLogs.filter((log) => log.source?.includes(filter.source!))
			}

			if (filter.since) {
				filteredLogs = filteredLogs.filter((log) => log.timestamp >= filter.since!)
			}
		}

		return filteredLogs
	}

	/**
	 * Get logs count by level
	 */
	public getLogCounts(): Record<LogLevel, number> {
		const counts: Record<LogLevel, number> = {
			info: 0,
			debug: 0,
			error: 0,
			warn: 0,
		}

		this.logs.forEach((log) => {
			counts[log.level]++
		})

		return counts
	}

	/**
	 * Subscribe to new log entries
	 */
	public subscribe(listener: (entry: LogEntry) => void): () => void {
		this.listeners.push(listener)

		// Return unsubscribe function
		return () => {
			const index = this.listeners.indexOf(listener)
			if (index > -1) {
				this.listeners.splice(index, 1)
			}
		}
	}

	/**
	 * Clear all logs
	 */
	public clear(): void {
		this.logs = []
	}

	/**
	 * Set maximum number of log entries to keep
	 */
	public setMaxEntries(max: number): void {
		this.maxEntries = max
		if (this.logs.length > max) {
			this.logs = this.logs.slice(0, max)
		}
	}

	/**
	 * Get current configuration
	 */
	public getConfig(): { maxEntries: number; totalLogs: number } {
		return {
			maxEntries: this.maxEntries,
			totalLogs: this.logs.length,
		}
	}
}

// Export singleton instance for easy access
export const logService = LogService.getInstance()
