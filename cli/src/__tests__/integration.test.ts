import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { ExtensionHost } from "../host/ExtensionHost.js"
import { logService } from "../services/LogService.js"

describe("Console Forwarding Integration", () => {
	let extensionHost: ExtensionHost
	let originalConsole: typeof console

	beforeEach(() => {
		originalConsole = { ...console }

		extensionHost = new ExtensionHost({
			workspacePath: "/test/workspace",
			extensionPath: "/test/extension",
			binUnpackedPath: "/test/bin",
		})
	})

	afterEach(async () => {
		if (extensionHost) {
			await extensionHost.deactivate()
		}
		Object.assign(console, originalConsole)
	})

	it("should forward extension console logs to LogService and make them available for retrieval", async () => {
		// Setup console interception first
		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		// Clear logs after setup to avoid counting setup logs
		logService.clear()

		// Simulate extension logging various types of messages
		console.log("Extension started successfully")
		console.error("Failed to load configuration", { config: "missing" })
		console.warn("Deprecated API usage detected")
		console.debug("Processing user input")
		console.info("Task completed")

		// Retrieve logs from LogService
		const allLogs = logService.getLogs()
		expect(allLogs).toHaveLength(5)

		// Verify logs are properly categorized
		const infoLogs = logService.getLogs({ levels: ["info"] })
		expect(infoLogs).toHaveLength(2) // log and info both map to 'info'

		const errorLogs = logService.getLogs({ levels: ["error"] })
		expect(errorLogs).toHaveLength(1)

		const warnLogs = logService.getLogs({ levels: ["warn"] })
		expect(warnLogs).toHaveLength(1)

		const debugLogs = logService.getLogs({ levels: ["debug"] })
		expect(debugLogs).toHaveLength(1)

		// Verify all logs have 'Extension' as source
		const extensionLogs = logService.getLogs({ source: "Extension" })
		expect(extensionLogs).toHaveLength(5)

		// Verify log counts
		const counts = logService.getLogCounts()
		expect(counts.info).toBe(2)
		expect(counts.error).toBe(1)
		expect(counts.warn).toBe(1)
		expect(counts.debug).toBe(1)
	})

	it("should restore console methods after calling restoreConsole", async () => {
		// Setup console interception
		const setupMethod = (extensionHost as any).setupConsoleInterception
		const restoreMethod = (extensionHost as any).restoreConsole

		setupMethod.call(extensionHost)

		// Verify console was intercepted
		expect(console.log).not.toBe(originalConsole.log)

		// Manually restore console
		restoreMethod.call(extensionHost)

		// Verify console was restored
		expect(console.log).toBe(originalConsole.log)
		expect(console.error).toBe(originalConsole.error)
		expect(console.warn).toBe(originalConsole.warn)
		expect(console.debug).toBe(originalConsole.debug)
		expect(console.info).toBe(originalConsole.info)
	})

	it("should handle complex log messages with objects and arrays", async () => {
		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		// Clear logs after setup to avoid counting setup logs
		logService.clear()

		const complexObject = {
			user: { id: 123, name: "John Doe" },
			settings: { theme: "dark", notifications: true },
			history: ["action1", "action2", "action3"],
		}

		console.log("User data:", complexObject, "Additional info:", [1, 2, 3])

		const logs = logService.getLogs()
		expect(logs).toHaveLength(1)

		const logMessage = logs[0].message
		expect(logMessage).toContain("User data:")
		expect(logMessage).toContain('"user":{"id":123,"name":"John Doe"}')
		expect(logMessage).toContain("Additional info:")
		expect(logMessage).toContain("[1,2,3]")
	})
})
