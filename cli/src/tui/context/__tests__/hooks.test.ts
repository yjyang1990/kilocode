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
		sidebarVisible: false,
		workspace: "/test/workspace",
		autoApprove: false,
		initialMode: "code",
		messageBridge: {} as any,
	},
	actions: {
		switchView: vi.fn(),
		sendMessage: vi.fn(),
		handleExtensionMessage: vi.fn(),
		toggleSidebar: vi.fn(),
		closeSidebar: vi.fn(),
		handleSidebarSelect: vi.fn(),
		setLoading: vi.fn(),
		setError: vi.fn(),
		exit: vi.fn(),
	},
}

vi.mock("../CliContext.js", () => ({
	useCliContext: () => mockContextValue,
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

	test("useSidebar returns sidebar utilities", () => {
		const sidebar = useSidebar()
		expect(sidebar.visible).toBe(false)
		expect(sidebar.toggle).toBe(mockContextValue.actions.toggleSidebar)
		expect(sidebar.close).toBe(mockContextValue.actions.closeSidebar)
		expect(sidebar.handleSelect).toBe(mockContextValue.actions.handleSidebarSelect)
	})

	// useCurrentView test removed - replaced by router hooks
})
