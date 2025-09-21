import { describe, it, expect, beforeEach } from "vitest"
import { LogService, logService } from "../services/LogService.js"

describe("LogService", () => {
	beforeEach(() => {
		// Clear logs before each test
		logService.clear()
	})

	it("should store logs with correct metadata", () => {
		logService.info("Test info message", "TestSource", { key: "value" })

		const logs = logService.getLogs()
		expect(logs).toHaveLength(1)

		const log = logs[0]
		expect(log.level).toBe("info")
		expect(log.message).toBe("Test info message")
		expect(log.source).toBe("TestSource")
		expect(log.context).toEqual({ key: "value" })
		expect(log.timestamp).toBeTypeOf("number")
		expect(log.id).toBeTypeOf("string")
	})

	it("should filter logs by level", () => {
		logService.info("Info message", "Test")
		logService.error("Error message", "Test")
		logService.warn("Warning message", "Test")
		logService.debug("Debug message", "Test")

		const errorLogs = logService.getLogs({ levels: ["error"] })
		expect(errorLogs).toHaveLength(1)
		expect(errorLogs[0].level).toBe("error")

		const infoAndWarnLogs = logService.getLogs({ levels: ["info", "warn"] })
		expect(infoAndWarnLogs).toHaveLength(2)
	})

	it("should filter logs by source", () => {
		logService.info("Message 1", "Extension")
		logService.info("Message 2", "ExtensionHost")
		logService.info("Message 3", "Other")

		const extensionLogs = logService.getLogs({ source: "Extension" })
		expect(extensionLogs).toHaveLength(2) // Should match both 'Extension' and 'ExtensionHost'
	})

	it("should maintain log count correctly", () => {
		logService.info("Info 1")
		logService.info("Info 2")
		logService.error("Error 1")
		logService.warn("Warning 1")
		logService.debug("Debug 1")

		const counts = logService.getLogCounts()
		expect(counts.info).toBe(2)
		expect(counts.error).toBe(1)
		expect(counts.warn).toBe(1)
		expect(counts.debug).toBe(1)
	})

	it("should notify subscribers of new logs", () => {
		const receivedLogs: any[] = []

		const unsubscribe = logService.subscribe((entry) => {
			receivedLogs.push(entry)
		})

		logService.info("Test message", "Test")
		logService.error("Error message", "Test")

		expect(receivedLogs).toHaveLength(2)
		expect(receivedLogs[0].message).toBe("Test message")
		expect(receivedLogs[1].message).toBe("Error message")

		unsubscribe()
	})
})
