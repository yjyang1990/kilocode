/**
 * Tests for command priority-based sorting in autocomplete engine
 */

import { describe, it, expect, beforeEach } from "vitest"
import { getSuggestions } from "../engine.js"
import { commandRegistry } from "../../commands/registry.js"
import type { Command } from "../../commands/types.js"

describe("Command Priority Sorting", () => {
	// Mock commands with different priorities
	const mockCommands: Command[] = [
		{
			name: "help",
			aliases: ["h"],
			description: "Display help",
			usage: "/help",
			examples: [],
			category: "system",
			priority: 10,
			handler: async () => {},
		},
		{
			name: "mode",
			aliases: ["m"],
			description: "Switch mode",
			usage: "/mode",
			examples: [],
			category: "settings",
			priority: 9,
			handler: async () => {},
		},
		{
			name: "clear",
			aliases: ["c"],
			description: "Clear messages",
			usage: "/clear",
			examples: [],
			category: "system",
			priority: 8,
			handler: async () => {},
		},
		{
			name: "exit",
			aliases: ["quit"],
			description: "Exit CLI",
			usage: "/exit",
			examples: [],
			category: "system",
			// No priority specified - should default to 5
			handler: async () => {},
		},
		{
			name: "test",
			aliases: [],
			description: "Test command",
			usage: "/test",
			examples: [],
			category: "system",
			priority: 5,
			handler: async () => {},
		},
	]

	beforeEach(() => {
		// Clear and register mock commands
		commandRegistry.clear()
		mockCommands.forEach((cmd) => commandRegistry.register(cmd))
	})

	describe("Priority as tiebreaker when match scores are equal", () => {
		it("should sort by priority when typing just '/' (all commands have same score)", () => {
			const suggestions = getSuggestions("/")

			// All commands should match with same score (50)
			// Should be sorted by priority: help(10), mode(9), clear(8), exit(5), test(5)
			expect(suggestions.length).toBeGreaterThan(0)
			expect(suggestions[0].command.name).toBe("help")
			expect(suggestions[1].command.name).toBe("mode")
			expect(suggestions[2].command.name).toBe("clear")

			// exit and test both have priority 5, should be alphabetically sorted
			const exitIndex = suggestions.findIndex((s) => s.command.name === "exit")
			const testIndex = suggestions.findIndex((s) => s.command.name === "test")
			expect(exitIndex).toBeLessThan(testIndex) // "exit" comes before "test" alphabetically
		})

		it("should use priority as tiebreaker for commands with same match score", () => {
			// Register two commands that would have the same match score
			const cmd1: Command = {
				name: "mail",
				aliases: [],
				description: "Mail command",
				usage: "/mail",
				examples: [],
				category: "system",
				priority: 7,
				handler: async () => {},
			}
			const cmd2: Command = {
				name: "make",
				aliases: [],
				description: "Make command",
				usage: "/make",
				examples: [],
				category: "system",
				priority: 6,
				handler: async () => {},
			}

			commandRegistry.register(cmd1)
			commandRegistry.register(cmd2)

			const suggestions = getSuggestions("/ma")

			// Both should match with same score (starts with "ma")
			const mailIndex = suggestions.findIndex((s) => s.command.name === "mail")
			const makeIndex = suggestions.findIndex((s) => s.command.name === "make")

			expect(mailIndex).toBeGreaterThan(-1)
			expect(makeIndex).toBeGreaterThan(-1)
			expect(mailIndex).toBeLessThan(makeIndex) // mail (priority 7) before make (priority 6)
		})
	})

	describe("Match score takes precedence over priority", () => {
		it("should prioritize better match score over higher priority", () => {
			const suggestions = getSuggestions("/he")

			// "help" should appear first because it has better match score (starts with "he")
			// even though other commands might have different priorities
			expect(suggestions[0].command.name).toBe("help")
			expect(suggestions[0].matchScore).toBeGreaterThan(50)
		})

		it("should show exact match first regardless of priority", () => {
			const suggestions = getSuggestions("/exit")

			// "exit" should be first with exact match score (100)
			// even though it has lower priority (5) than help (10)
			expect(suggestions[0].command.name).toBe("exit")
			expect(suggestions[0].matchScore).toBe(100)
		})
	})

	describe("Alphabetical sorting as final tiebreaker", () => {
		it("should sort alphabetically when match scores and priorities are equal", () => {
			// Register commands with same priority
			const cmdA: Command = {
				name: "apple",
				aliases: [],
				description: "Apple command",
				usage: "/apple",
				examples: [],
				category: "system",
				priority: 5,
				handler: async () => {},
			}
			const cmdB: Command = {
				name: "banana",
				aliases: [],
				description: "Banana command",
				usage: "/banana",
				examples: [],
				category: "system",
				priority: 5,
				handler: async () => {},
			}

			commandRegistry.clear()
			commandRegistry.register(cmdB) // Register in reverse order
			commandRegistry.register(cmdA)

			const suggestions = getSuggestions("/")

			const appleIndex = suggestions.findIndex((s) => s.command.name === "apple")
			const bananaIndex = suggestions.findIndex((s) => s.command.name === "banana")

			expect(appleIndex).toBeLessThan(bananaIndex) // "apple" before "banana"
		})
	})

	describe("Default priority behavior", () => {
		it("should use default priority of 5 for commands without explicit priority", () => {
			const suggestions = getSuggestions("/")

			// Find exit command (no explicit priority)
			const exitSuggestion = suggestions.find((s) => s.command.name === "exit")
			expect(exitSuggestion).toBeDefined()

			// Find test command (explicit priority 5)
			const testSuggestion = suggestions.find((s) => s.command.name === "test")
			expect(testSuggestion).toBeDefined()

			// Both should be sorted alphabetically since they have same priority
			const exitIndex = suggestions.findIndex((s) => s.command.name === "exit")
			const testIndex = suggestions.findIndex((s) => s.command.name === "test")
			expect(exitIndex).toBeLessThan(testIndex)
		})
	})

	describe("Complex sorting scenarios", () => {
		it("should correctly sort with multiple criteria", () => {
			// Register additional commands to test complex sorting
			const cmdHigh: Command = {
				name: "high",
				aliases: [],
				description: "High priority",
				usage: "/high",
				examples: [],
				category: "system",
				priority: 10,
				handler: async () => {},
			}
			const cmdMed: Command = {
				name: "medium",
				aliases: [],
				description: "Medium priority",
				usage: "/medium",
				examples: [],
				category: "system",
				priority: 5,
				handler: async () => {},
			}
			const cmdLow: Command = {
				name: "low",
				aliases: [],
				description: "Low priority",
				usage: "/low",
				examples: [],
				category: "system",
				priority: 1,
				handler: async () => {},
			}

			commandRegistry.clear()
			commandRegistry.register(cmdLow)
			commandRegistry.register(cmdHigh)
			commandRegistry.register(cmdMed)

			const suggestions = getSuggestions("/")

			// Should be sorted by priority: high(10), medium(5), low(1)
			expect(suggestions[0].command.name).toBe("high")
			expect(suggestions[1].command.name).toBe("medium")
			expect(suggestions[2].command.name).toBe("low")
		})
	})
})
