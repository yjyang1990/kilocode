/**
 * Tests for StatusIndicator component
 */

import React from "react"
import { render } from "ink-testing-library"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { Provider as JotaiProvider } from "jotai"
import { createStore } from "jotai"
import { StatusIndicator } from "../StatusIndicator.js"
import { isProcessingAtom, showFollowupSuggestionsAtom } from "../../../state/atoms/ui.js"

// Mock the hooks
vi.mock("../../../state/hooks/useWebviewMessage.js", () => ({
	useWebviewMessage: () => ({
		cancelTask: vi.fn(),
	}),
}))

describe("StatusIndicator", () => {
	let store: ReturnType<typeof createStore>

	beforeEach(() => {
		store = createStore()
	})

	it("should not render when disabled", () => {
		const { lastFrame } = render(
			<JotaiProvider store={store}>
				<StatusIndicator disabled={true} />
			</JotaiProvider>,
		)

		expect(lastFrame()).toBe("")
	})

	it("should show Thinking status and cancel hotkey when processing", () => {
		store.set(isProcessingAtom, true)

		const { lastFrame } = render(
			<JotaiProvider store={store}>
				<StatusIndicator disabled={false} />
			</JotaiProvider>,
		)

		const output = lastFrame()
		expect(output).toContain("Thinking...")
		expect(output).toContain("to cancel")
		// Should show either Ctrl+X or Cmd+X depending on platform
		expect(output).toMatch(/(?:Ctrl|Cmd)\+X/)
	})

	it("should show followup hotkeys when suggestions are visible", () => {
		store.set(showFollowupSuggestionsAtom, true)

		const { lastFrame } = render(
			<JotaiProvider store={store}>
				<StatusIndicator disabled={false} />
			</JotaiProvider>,
		)

		const output = lastFrame()
		expect(output).toContain("to navigate")
		expect(output).toContain("to fill")
		expect(output).toContain("to submit")
	})

	it("should show general command hints when idle", () => {
		store.set(isProcessingAtom, false)
		store.set(showFollowupSuggestionsAtom, false)

		const { lastFrame } = render(
			<JotaiProvider store={store}>
				<StatusIndicator disabled={false} />
			</JotaiProvider>,
		)

		const output = lastFrame()
		expect(output).toContain("/help")
		expect(output).toContain("for commands")
	})

	it("should not show Thinking status when not processing", () => {
		store.set(isProcessingAtom, false)

		const { lastFrame } = render(
			<JotaiProvider store={store}>
				<StatusIndicator disabled={false} />
			</JotaiProvider>,
		)

		const output = lastFrame()
		expect(output).not.toContain("Thinking...")
	})
})
