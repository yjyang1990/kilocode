import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "fs-extra"
import * as path from "path"
import * as os from "os"
import { LogsService } from "../services/logs.js"
import { KiloCodePaths } from "../utils/paths.js"

describe("LogsService File Logging", () => {
	let tempDir: string
	let logs: LogsService
	let originalHome: string | undefined

	beforeEach(async () => {
		// Create temporary directory for testing
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kilocode-log-test-"))

		// Save original HOME and set to temp directory
		originalHome = process.env.HOME
		process.env.HOME = tempDir

		// Reset singleton instance
		;(LogsService as any).instance = null

		// Get fresh instance
		logs = LogsService.getInstance()

		// Wait a bit for async initialization
		await new Promise((resolve) => setTimeout(resolve, 100))
	})

	afterEach(async () => {
		// Restore original HOME
		if (originalHome !== undefined) {
			process.env.HOME = originalHome
		} else {
			delete process.env.HOME
		}

		// Clean up temp directory
		await fs.remove(tempDir)

		// Reset singleton
		;(LogsService as any).instance = null
	})

	it("should create log directory and file", async () => {
		// Log something
		logs.info("Test message", "TestSource")

		// Wait for async file operations
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Check if directory exists (now in HOME/.kilocode/logs)
		const logDir = KiloCodePaths.getLogsDir()
		expect(await fs.pathExists(logDir)).toBe(true)

		// Check if log file exists
		const logFile = path.join(logDir, "cli.txt")
		expect(await fs.pathExists(logFile)).toBe(true)
	})

	it("should write log entries to file with correct format", async () => {
		// Log different types of messages
		logs.info("Info message", "TestSource")
		logs.error("Error message", "TestSource", { error: "details" })
		logs.warn("Warning message")
		logs.debug("Debug message", "TestSource")

		// Wait for async file operations
		await new Promise((resolve) => setTimeout(resolve, 200))

		// Read log file
		const logFile = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		const logContent = await fs.readFile(logFile, "utf8")
		const logLines = logContent.trim().split("\n")

		// Should have 4 log entries
		expect(logLines).toHaveLength(4)

		// Check that all expected log entries are present (order may vary due to async operations)
		const allLogContent = logLines.join("\n")
		expect(allLogContent).toMatch(/\[TestSource\] INFO: Info message/)
		expect(allLogContent).toMatch(/\[TestSource\] ERROR: Error message {"error":"details"}/)
		expect(allLogContent).toMatch(/WARN: Warning message/)
		expect(allLogContent).toMatch(/\[TestSource\] DEBUG: Debug message/)

		// Check that all entries have proper timestamp format
		logLines.forEach((line) => {
			expect(line).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
		})
	})

	it("should append to existing log file", async () => {
		// Write first log
		logs.info("First message")
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Write second log
		logs.info("Second message")
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Read log file
		const logFile = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		const logContent = await fs.readFile(logFile, "utf8")
		const logLines = logContent.trim().split("\n")

		// Should have both messages
		expect(logLines).toHaveLength(2)
		expect(logLines[0]).toContain("First message")
		expect(logLines[1]).toContain("Second message")
	})

	it("should handle file logging gracefully", async () => {
		// This should not throw even if there are file system issues
		expect(() => {
			logs.error("Test error message")
		}).not.toThrow()

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 200))

		// File logging should be enabled in normal conditions
		expect(logs.isFileLoggingEnabled()).toBe(true)
	})

	it("should provide correct log file path", () => {
		const expectedPath = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		expect(logs.getLogFilePath()).toBe(expectedPath)
	})

	it("should include file logging status in config", () => {
		const config = logs.getConfig()
		expect(config).toHaveProperty("fileLoggingEnabled")
		expect(config).toHaveProperty("logFilePath")
		expect(typeof config.fileLoggingEnabled).toBe("boolean")
		expect(typeof config.logFilePath).toBe("string")
	})

	it("should initialize file logging properly", async () => {
		// Reset singleton to test initialization
		;(LogsService as any).instance = null

		// Create new instance
		const newLogsService = LogsService.getInstance()

		// Wait for async initialization
		await new Promise((resolve) => setTimeout(resolve, 200))

		// File logging should be enabled in normal conditions
		expect(newLogsService.isFileLoggingEnabled()).toBe(true)
		expect(newLogsService.getLogFilePath()).toContain("cli.txt")
	})

	it("should format log entries without source correctly", async () => {
		logs.info("Message without source")

		// Wait for async file operations
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Read log file
		const logFile = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		const logContent = await fs.readFile(logFile, "utf8")

		// Should have correct format without source brackets
		expect(logContent).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z  INFO: Message without source\n$/)
	})

	it("should format log entries with context correctly", async () => {
		const context = { userId: 123, action: "test", nested: { key: "value" } }
		logs.info("Message with context", "TestSource", context)

		// Wait for async file operations
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Read log file
		const logFile = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		const logContent = await fs.readFile(logFile, "utf8")

		// Should include JSON stringified context
		expect(logContent).toContain('{"userId":123,"action":"test","nested":{"key":"value"}}')
	})
})
