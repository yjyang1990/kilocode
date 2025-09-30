import React from "react"
import { render } from "ink-testing-library"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { LogsView } from "../LogsView.js"
import { logService } from "../../../../services/LogService.js"

// Mock the context hooks
vi.mock("../../../context/index.js", () => ({
	useExtensionState: () => ({
		config: {},
		profiles: [],
		activeProfile: null,
	}),
	useExtensionMessage: () => ({
		sendMessage: vi.fn(),
	}),
	useSidebar: () => ({
		visible: false,
	}),
}))

// Mock the router
vi.mock("../../../router/index.js", () => ({
	useRouter: () => ({
		goBack: vi.fn(),
		navigate: vi.fn(),
	}),
}))

// Mock the keyboard navigation hook
vi.mock("../../../hooks/useKeyboardNavigation.js", () => ({
	useKeyboardNavigation: vi.fn(),
}))

describe("LogsView", () => {
	beforeEach(() => {
		// Clear logs before each test
		logService.clear()
	})

	it("should render with dynamic height ScrollArea", () => {
		const { lastFrame } = render(<LogsView />)
		const output = lastFrame()

		// The component should render without errors
		expect(output).toBeDefined()

		// Should contain the header
		expect(output).toContain("Logs")

		// Should show filter controls
		expect(output).toContain("Filters:")
	})

	it("should display logs when they exist", () => {
		// Add some test logs
		logService.info("Test info message", "TestSource")
		logService.error("Test error message", "TestSource")

		const { lastFrame } = render(<LogsView />)
		const output = lastFrame()

		// Should display the log messages
		expect(output).toContain("Test info message")
		expect(output).toContain("Test error message")
	})

	it("should show empty state when no logs", () => {
		const { lastFrame } = render(<LogsView />)
		const output = lastFrame()

		// Should show empty state message
		expect(output).toContain("No logs to display")
	})
})
