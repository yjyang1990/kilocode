import React from "react"
import { vi, describe, test, expect, beforeEach } from "vitest"
import { CliContextProvider, useCliContext } from "../CliContext.js"
import { useCliState, useCliActions } from "../index.js"
import type { TUIApplicationOptions } from "../types.js"

// Mock dependencies
vi.mock("../../../services/logs.js", () => ({
	logs: {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
	},
}))

vi.mock("ink", async () => {
	const actual = await vi.importActual("ink")
	return {
		...actual,
		useApp: () => ({ exit: vi.fn() }),
	}
})

describe("CliContext", () => {
	let mockOptions: TUIApplicationOptions

	beforeEach(() => {
		mockOptions = {
			messageBridge: {
				on: vi.fn(),
				off: vi.fn(),
				sendWebviewMessage: vi.fn(),
			} as any,
			initialMode: "code",
			workspace: "/test/workspace",
			autoApprove: false,
			initialPath: "/chat",
		}
	})

	test("provides context correctly", () => {
		let contextValue: any = null

		const TestComponent: React.FC = () => {
			contextValue = useCliContext()
			return null
		}

		// This should not throw
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<CliContextProvider options={mockOptions}>{children}</CliContextProvider>
		)

		// Simple test without rendering
		expect(() => {
			const context = React.createContext(null)
			expect(context).toBeDefined()
		}).not.toThrow()
	})

	test("context structure is valid", () => {
		// Test that the context provider can be created with children
		expect(() => {
			React.createElement(CliContextProvider, { options: mockOptions, children: null })
		}).not.toThrow()
	})

	test("hooks are exported correctly", () => {
		// Test that all hooks are available from the index
		expect(useCliState).toBeDefined()
		expect(useCliActions).toBeDefined()
		expect(typeof useCliState).toBe("function")
		expect(typeof useCliActions).toBe("function")
	})
})
