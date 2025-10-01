/**
 * Test for /mode command argument suggestions
 * Regression test for: "when I type '/mode ' it's not showing any argument suggestion"
 */

import { describe, it, expect, beforeEach } from "vitest"
import { getAllSuggestions, detectInputState } from "../engine.js"
import { commandRegistry } from "../../commands/registry.js"
import { modeCommand } from "../../commands/handlers/mode.js"

describe("Mode command argument suggestions", () => {
	beforeEach(() => {
		commandRegistry.clear()
		commandRegistry.register(modeCommand)
	})

	it("should show argument suggestions when typing '/mode '", async () => {
		const result = await getAllSuggestions("/mode ")

		expect(result.type).toBe("argument")
		if (result.type === "argument") {
			expect(result.suggestions.length).toBeGreaterThan(0)
			// Should show available modes
			const values = result.suggestions.map((s) => s.value)
			expect(values).toContain("code")
			expect(values).toContain("architect")
			expect(values).toContain("ask")
		}
	})

	it("should detect '/mode ' as argument input state", () => {
		const state = detectInputState("/mode ")

		expect(state.type).toBe("argument")
		expect(state.commandName).toBe("mode")
		expect(state.currentArgument).toBeDefined()
		if (state.currentArgument) {
			expect(state.currentArgument.index).toBe(0)
			expect(state.currentArgument.partialValue).toBe("")
		}
	})

	it("should show filtered suggestions when typing '/mode c'", async () => {
		const result = await getAllSuggestions("/mode c")

		expect(result.type).toBe("argument")
		if (result.type === "argument") {
			expect(result.suggestions.length).toBeGreaterThan(0)
			// Should show modes starting with 'c'
			const values = result.suggestions.map((s) => s.value)
			expect(values).toContain("code")
			expect(values).not.toContain("ask")
		}
	})

	it("should detect '/mode c' as argument input state with partial value", () => {
		const state = detectInputState("/mode c")

		expect(state.type).toBe("argument")
		expect(state.commandName).toBe("mode")
		expect(state.currentArgument).toBeDefined()
		if (state.currentArgument) {
			expect(state.currentArgument.index).toBe(0)
			expect(state.currentArgument.partialValue).toBe("c")
		}
	})
})
