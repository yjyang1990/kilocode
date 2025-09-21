import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { ExtensionHost } from "../host/ExtensionHost.js"
import { logService } from "../services/LogService.js"

describe("ExtensionHost Console Interception", () => {
	let extensionHost: ExtensionHost
	let originalConsole: typeof console

	beforeEach(() => {
		// Store original console methods
		originalConsole = { ...console }

		// Clear log service
		logService.clear()

		// Create extension host instance
		extensionHost = new ExtensionHost({
			workspacePath: "/test/workspace",
			extensionPath: "/test/extension",
			binUnpackedPath: "/test/bin",
		})
	})

	afterEach(async () => {
		// Clean up
		if (extensionHost) {
			await extensionHost.deactivate()
		}

		// Restore original console
		Object.assign(console, originalConsole)
	})

	it("should intercept console.log and forward to LogService only", async () => {
		// Spy on logService methods
		const infoSpy = vi.spyOn(logService, "info")
		// Spy on original console to verify it's NOT called
		const originalLogSpy = vi.spyOn(originalConsole, "log")

		// Setup console interception (this happens during setupVSCodeAPIMock)
		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		// Test console.log interception
		console.log("Test log message")

		// Verify that LogService received the message
		expect(infoSpy).toHaveBeenCalledWith("Test log message", "Extension")
		// Verify that original console was NOT called
		expect(originalLogSpy).not.toHaveBeenCalled()
	})

	it("should intercept console.error and forward to LogService only", async () => {
		const errorSpy = vi.spyOn(logService, "error")
		const originalErrorSpy = vi.spyOn(originalConsole, "error")

		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		console.error("Test error message")

		expect(errorSpy).toHaveBeenCalledWith("Test error message", "Extension")
		expect(originalErrorSpy).not.toHaveBeenCalled()
	})

	it("should intercept console.warn and forward to LogService only", async () => {
		const warnSpy = vi.spyOn(logService, "warn")
		const originalWarnSpy = vi.spyOn(originalConsole, "warn")

		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		console.warn("Test warning message")

		expect(warnSpy).toHaveBeenCalledWith("Test warning message", "Extension")
		expect(originalWarnSpy).not.toHaveBeenCalled()
	})

	it("should intercept console.debug and forward to LogService only", async () => {
		const debugSpy = vi.spyOn(logService, "debug")
		const originalDebugSpy = vi.spyOn(originalConsole, "debug")

		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		console.debug("Test debug message")

		expect(debugSpy).toHaveBeenCalledWith("Test debug message", "Extension")
		expect(originalDebugSpy).not.toHaveBeenCalled()
	})

	it("should handle multiple arguments in console calls", async () => {
		const infoSpy = vi.spyOn(logService, "info")
		const originalLogSpy = vi.spyOn(originalConsole, "log")

		const setupMethod = (extensionHost as any).setupConsoleInterception
		setupMethod.call(extensionHost)

		console.log("Message with", "multiple", "arguments", { key: "value" })

		expect(infoSpy).toHaveBeenCalledWith('Message with multiple arguments {"key":"value"}', "Extension")
		expect(originalLogSpy).not.toHaveBeenCalled()
	})

	it("should restore console methods when restoreConsole is called", async () => {
		const setupMethod = (extensionHost as any).setupConsoleInterception
		const restoreMethod = (extensionHost as any).restoreConsole

		setupMethod.call(extensionHost)

		// Verify console was intercepted
		const interceptedLog = console.log
		expect(interceptedLog).not.toBe(originalConsole.log)

		// Restore console
		restoreMethod.call(extensionHost)

		// Verify console was restored
		expect(console.log).toBe(originalConsole.log)
	})
})
