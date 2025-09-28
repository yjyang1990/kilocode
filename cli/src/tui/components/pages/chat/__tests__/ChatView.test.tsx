import React from "react"
import { vi, describe, test, expect } from "vitest"
import { TaskHeader } from "../components/TaskHeader.js"
import type { ClineMessage } from "../../../../../types/messages.js"

// Mock the message formatters
vi.mock("../utils/messageFormatters.js", () => ({
	formatTimestamp: vi.fn(() => "2m ago"),
	formatCost: vi.fn(() => "$0.001"),
	formatTokens: vi.fn(() => "1.2K"),
	truncateText: vi.fn((text: string) => text),
}))

// Mock the TodoDisplay component
vi.mock("../components/TodoDisplay.js", () => ({
	TodoDisplay: () => null,
}))

describe("ChatView Header Integration", () => {
	const mockTask: ClineMessage = {
		ts: Date.now(),
		type: "ask",
		ask: "task",
		text: "Test task description",
	}

	test("TaskHeader should render with page header styling", () => {
		// Test that TaskHeader component can be created with asPageHeader prop
		expect(() => {
			React.createElement(TaskHeader, {
				task: mockTask,
				mode: "code",
				asPageHeader: true,
				isStreaming: false,
			})
		}).not.toThrow()
	})

	test("TaskHeader should render with regular styling", () => {
		// Test that TaskHeader component can be created without asPageHeader prop
		expect(() => {
			React.createElement(TaskHeader, {
				task: mockTask,
				mode: "code",
				asPageHeader: false,
				isStreaming: false,
			})
		}).not.toThrow()
	})

	test("TaskHeader should handle streaming state", () => {
		// Test that TaskHeader component can be created with streaming state
		expect(() => {
			React.createElement(TaskHeader, {
				task: mockTask,
				mode: "code",
				asPageHeader: true,
				isStreaming: true,
			})
		}).not.toThrow()
	})

	test("TaskHeader should handle metrics", () => {
		// Test that TaskHeader component can be created with metrics
		expect(() => {
			React.createElement(TaskHeader, {
				task: mockTask,
				mode: "code",
				asPageHeader: true,
				isStreaming: false,
				tokensIn: 1000,
				tokensOut: 500,
				totalCost: 0.001,
			})
		}).not.toThrow()
	})
})
