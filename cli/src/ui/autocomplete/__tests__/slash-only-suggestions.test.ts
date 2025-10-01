/**
 * Test for slash-only input showing suggestions
 * Regression test for: "when I type '/' only is not showing any suggestion"
 */

import { describe, it, expect, beforeEach } from "vitest"
import { getAllSuggestions, detectInputState } from "../engine.js"
import { commandRegistry } from "../../commands/registry.js"
import type { Command } from "../../commands/types.js"

describe("Slash-only input suggestions", () => {
	const testCommands: Command[] = [
		{
			name: "help",
			aliases: [],
			description: "Show help",
			usage: "/help",
			examples: [],
			category: "system",
			handler: async () => {},
		},
		{
			name: "mode",
			aliases: [],
			description: "Switch mode",
			usage: "/mode",
			examples: [],
			category: "navigation",
			handler: async () => {},
		},
		{
			name: "clear",
			aliases: [],
			description: "Clear screen",
			usage: "/clear",
			examples: [],
			category: "system",
			handler: async () => {},
		},
	]

	beforeEach(() => {
		commandRegistry.clear()
		testCommands.forEach((cmd) => commandRegistry.register(cmd))
	})

	it("should show suggestions when typing just '/'", async () => {
		const result = await getAllSuggestions("/")

		expect(result.type).toBe("command")
		if (result.type === "command") {
			expect(result.suggestions.length).toBeGreaterThan(0)
			expect(result.suggestions.length).toBe(3) // All 3 commands should be shown
		}
	})

	it("should detect '/' as command input state", () => {
		const state = detectInputState("/")

		expect(state.type).toBe("command")
		expect(state.commandName).toBe("")
	})

	it("should not show suggestions for empty input", async () => {
		const result = await getAllSuggestions("")

		expect(result.type).toBe("none")
		expect(result.suggestions.length).toBe(0)
	})

	it("should not show suggestions for input without slash", async () => {
		const result = await getAllSuggestions("help")

		expect(result.type).toBe("none")
		expect(result.suggestions.length).toBe(0)
	})
})
