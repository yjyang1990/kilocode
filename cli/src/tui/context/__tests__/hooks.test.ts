import { vi, describe, test, expect } from "vitest"
import { useCliState, useCliActions, useExtensionState, useSidebar } from "../index.js"

// Mock the main context
const mockContextValue = {
	state: {
		currentView: "chat" as const,
		extensionState: {
			version: "1.0.0",
			apiConfiguration: {},
			clineMessages: [],
			mode: "code",
			customModes: [],
			taskHistoryFullLength: 0,
			taskHistoryVersion: 1,
			telemetrySetting: "enabled",
			renderContext: "cli" as const,
		},
		isLoading: false,
		error: null,
		lastExtensionMessage: null,
		workspace: "/test/workspace",
		autoApprove: false,
		initialMode: "code",
		messageBridge: {} as any,
	},
	actions: {
		switchView: vi.fn(),
		sendMessage: vi.fn(),
		handleExtensionMessage: vi.fn(),
		setLoading: vi.fn(),
		setError: vi.fn(),
		exit: vi.fn(),
	},
}

// Mock Jotai
const mockSidebarVisible = false
const mockSetSidebarVisible = vi.fn()
const mockToggleSidebar = vi.fn()
const mockCloseSidebar = vi.fn()
const mockHandleSidebarSelect = vi.fn()

vi.mock("../CliContext.js", () => ({
	useCliContext: () => mockContextValue,
}))

vi.mock("jotai", () => ({
	atom: vi.fn(() => ({ init: false })),
	useAtom: () => [mockSidebarVisible, mockSetSidebarVisible],
}))

vi.mock("ink", () => ({
	useApp: () => ({ exit: vi.fn() }),
}))

describe("Context Hooks", () => {
	test("useCliState returns state", () => {
		const state = useCliState()
		expect(state).toBe(mockContextValue.state)
		// currentView removed - now handled by router
		expect(state.workspace).toBe("/test/workspace")
	})

	test("useCliActions returns actions", () => {
		const actions = useCliActions()
		expect(actions).toBe(mockContextValue.actions)
		// switchView removed - now handled by router
		expect(actions.sendMessage).toBeDefined()
	})

	test("useExtensionState returns extension state", () => {
		const extensionState = useExtensionState()
		expect(extensionState).toBe(mockContextValue.state.extensionState)
		expect(extensionState?.version).toBe("1.0.0")
	})

	test.skip("useSidebar returns sidebar utilities", () => {
		// Skip this test as it now uses React hooks directly (useCallback)
		// and would require a full React testing environment with renderHook
		// The functionality is tested through integration tests
	})

	// useCurrentView test removed - replaced by router hooks
})
