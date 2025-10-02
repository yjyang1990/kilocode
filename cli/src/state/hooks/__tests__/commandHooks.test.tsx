/**
 * Tests for command-related hooks
 *
 * Note: These are basic unit tests for the hook logic.
 * Full integration testing would require @testing-library/react.
 */

import { describe, it, expect, beforeEach } from "vitest"
import { createStore } from "jotai"

describe("Command Hook Exports", () => {
	let store: ReturnType<typeof createStore>

	beforeEach(() => {
		store = createStore()
	})

	describe("Hook Exports", () => {
		it("should export useCommandContext", async () => {
			const { useCommandContext } = await import("../useCommandContext.js")
			expect(useCommandContext).toBeDefined()
			expect(typeof useCommandContext).toBe("function")
		})

		it("should export useCommandHandler", async () => {
			const { useCommandHandler } = await import("../useCommandHandler.js")
			expect(useCommandHandler).toBeDefined()
			expect(typeof useCommandHandler).toBe("function")
		})

		it("should export useMessageHandler", async () => {
			const { useMessageHandler } = await import("../useMessageHandler.js")
			expect(useMessageHandler).toBeDefined()
			expect(typeof useMessageHandler).toBe("function")
		})

		it("should export useWelcomeMessage", async () => {
			const { useWelcomeMessage, getDefaultWelcomeContent } = await import("../useWelcomeMessage.js")
			expect(useWelcomeMessage).toBeDefined()
			expect(typeof useWelcomeMessage).toBe("function")
			expect(getDefaultWelcomeContent).toBeDefined()
			expect(typeof getDefaultWelcomeContent).toBe("function")
		})
	})

	describe("Hook Integration in index.ts", () => {
		it("should export all new command hooks from index", async () => {
			const hooks = await import("../index.js")

			// Check new hooks are exported
			expect(hooks.useCommandContext).toBeDefined()
			expect(hooks.useCommandHandler).toBeDefined()
			expect(hooks.useMessageHandler).toBeDefined()
			expect(hooks.useWelcomeMessage).toBeDefined()
			expect(hooks.getDefaultWelcomeContent).toBeDefined()

			// Check existing hooks are still exported
			expect(hooks.useExtensionService).toBeDefined()
			expect(hooks.useWebviewMessage).toBeDefined()
			expect(hooks.useExtensionMessage).toBeDefined()
			expect(hooks.useTaskManagement).toBeDefined()
			expect(hooks.useModelSelection).toBeDefined()
			expect(hooks.useCommandInput).toBeDefined()
		})

		it("should export hook types", async () => {
			const hooks = await import("../index.js")

			// Verify functions are exported
			expect(typeof hooks.useCommandContext).toBe("function")
			expect(typeof hooks.useCommandHandler).toBe("function")
			expect(typeof hooks.useMessageHandler).toBe("function")
			expect(typeof hooks.useWelcomeMessage).toBe("function")
			expect(typeof hooks.getDefaultWelcomeContent).toBe("function")
		})
	})

	describe("Welcome Message", () => {
		it("should provide default welcome content", async () => {
			const { getDefaultWelcomeContent } = await import("../useWelcomeMessage.js")
			const content = getDefaultWelcomeContent()

			expect(Array.isArray(content)).toBe(true)
			expect(content.length).toBeGreaterThan(0)
			expect(content[0]).toContain("Welcome to Kilo Code CLI")
		})
	})
})

describe("Command Executor Service", () => {
	it("should export command executor functions", async () => {
		const executor = await import("../../../services/commandExecutor.js")

		expect(executor.validateCommand).toBeDefined()
		expect(executor.executeCommandWithContext).toBeDefined()
		expect(executor.parseCommandInput).toBeDefined()
		expect(executor.hasRequiredArguments).toBeDefined()
		expect(executor.validateArguments).toBeDefined()
		expect(executor.formatCommandError).toBeDefined()
		expect(executor.getCommandUsage).toBeDefined()
		expect(executor.isCompleteCommand).toBeDefined()
	})

	it("should validate command functions are callable", async () => {
		const executor = await import("../../../services/commandExecutor.js")

		expect(typeof executor.validateCommand).toBe("function")
		expect(typeof executor.executeCommandWithContext).toBe("function")
		expect(typeof executor.parseCommandInput).toBe("function")
		expect(typeof executor.hasRequiredArguments).toBe("function")
		expect(typeof executor.validateArguments).toBe("function")
		expect(typeof executor.formatCommandError).toBe("function")
		expect(typeof executor.getCommandUsage).toBe("function")
		expect(typeof executor.isCompleteCommand).toBe("function")
	})
})
