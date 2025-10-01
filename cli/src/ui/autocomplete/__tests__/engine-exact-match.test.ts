/**
 * Tests for autocomplete engine - exact match behavior
 */

import { describe, it, expect, beforeEach } from "vitest"
import { getSuggestions, detectInputState, getAllSuggestions } from "../engine.js"
import { commandRegistry } from "../../commands/registry.js"
import type { Command } from "../../commands/types.js"

describe("Autocomplete Engine - Exact Match Behavior", () => {
	const testCommand: Command = {
		name: "mode",
		aliases: [],
		description: "Switch to a different mode",
		usage: "/mode <mode-name>",
		examples: ["/mode code", "/mode ask"],
		category: "navigation",
		handler: async () => {},
	}

	beforeEach(() => {
		// Clear registry and register test command
		commandRegistry.clear()
		commandRegistry.register(testCommand)
	})

	it("should return suggestions for exact command match", () => {
		const suggestions = getSuggestions("/mode")

		expect(suggestions.length).toBeGreaterThan(0)
		expect(suggestions[0].command.name).toBe("mode")
		expect(suggestions[0].matchScore).toBe(100)
	})

	it("should return suggestions for partial command match", () => {
		const suggestions = getSuggestions("/mod")

		expect(suggestions.length).toBeGreaterThan(0)
		expect(suggestions[0].command.name).toBe("mode")
		expect(suggestions[0].matchScore).toBeGreaterThan(0)
	})

	it("should return suggestions when typing just /", () => {
		const suggestions = getSuggestions("/")

		expect(suggestions.length).toBeGreaterThan(0)
	})

	it("should give exact matches the highest score", () => {
		// Register multiple commands
		commandRegistry.register({
			name: "model",
			aliases: [],
			description: "Select a model",
			usage: "/model",
			examples: [],
			category: "settings",
			handler: async () => {},
		})

		const suggestions = getSuggestions("/mode")

		// "mode" should be first with score 100 (exact match)
		expect(suggestions[0].command.name).toBe("mode")
		expect(suggestions[0].matchScore).toBe(100)

		// "model" should be second with lower score (partial match)
		if (suggestions.length > 1) {
			expect(suggestions[1].command.name).toBe("model")
			expect(suggestions[1].matchScore).toBeLessThan(100)
		}
	})

	it("should detect exact command match as 'command' type, not 'none'", () => {
		const state = detectInputState("/mode")

		expect(state.type).toBe("command")
		expect(state.commandName).toBe("mode")
		expect(state.command).toBeDefined()
		expect(state.command?.name).toBe("mode")
	})

	it("should return command suggestions for exact match via getAllSuggestions", async () => {
		const result = await getAllSuggestions("/mode")

		expect(result.type).toBe("command")
		if (result.type === "command") {
			expect(result.suggestions.length).toBeGreaterThan(0)
			expect(result.suggestions[0].command.name).toBe("mode")
		}
	})
})
