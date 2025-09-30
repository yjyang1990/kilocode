import { describe, it, expect, beforeEach, afterEach } from "vitest"
import * as fs from "fs-extra"
import * as path from "path"
import * as os from "os"
import { LogService } from "../services/LogService.js"
import { KiloCodePaths } from "../utils/paths.js"

describe("LogService File Logging", () => {
	let tempDir: string
	let logService: LogService
	let originalHome: string | undefined

	beforeEach(async () => {
		// Create temporary directory for testing
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kilocode-log-test-"))

		// Save original HOME and set to temp directory
		originalHome = process.env.HOME
		process.env.HOME = tempDir

		// Reset singleton instance
		;(LogService as any).instance = null

		// Get fresh instance
		logService = LogService.getInstance()

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
		;(LogService as any).instance = null
	})

	it("should create log directory and file", async () => {
		// Log something
		logService.info("Test message", "TestSource")

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
		logService.info("Info message", "TestSource")
		logService.error("Error message", "TestSource", { error: "details" })
		logService.warn("Warning message")
		logService.debug("Debug message", "TestSource")

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
		logService.info("First message")
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Write second log
		logService.info("Second message")
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
			logService.error("Test error message")
		}).not.toThrow()

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 200))

		// File logging should be enabled in normal conditions
		expect(logService.isFileLoggingEnabled()).toBe(true)
	})

	it("should provide correct log file path", () => {
		const expectedPath = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		expect(logService.getLogFilePath()).toBe(expectedPath)
	})

	it("should include file logging status in config", () => {
		const config = logService.getConfig()
		expect(config).toHaveProperty("fileLoggingEnabled")
		expect(config).toHaveProperty("logFilePath")
		expect(typeof config.fileLoggingEnabled).toBe("boolean")
		expect(typeof config.logFilePath).toBe("string")
	})

	it("should initialize file logging properly", async () => {
		// Reset singleton to test initialization
		;(LogService as any).instance = null

		// Create new instance
		const newLogService = LogService.getInstance()

		// Wait for async initialization
		await new Promise((resolve) => setTimeout(resolve, 200))

		// File logging should be enabled in normal conditions
		expect(newLogService.isFileLoggingEnabled()).toBe(true)
		expect(newLogService.getLogFilePath()).toContain("cli.txt")
	})

	it("should format log entries without source correctly", async () => {
		logService.info("Message without source")

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
		logService.info("Message with context", "TestSource", context)

		// Wait for async file operations
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Read log file
		const logFile = path.join(KiloCodePaths.getLogsDir(), "cli.txt")
		const logContent = await fs.readFile(logFile, "utf8")

		// Should include JSON stringified context
		expect(logContent).toContain('{"userId":123,"action":"test","nested":{"key":"value"}}')
	})
})
