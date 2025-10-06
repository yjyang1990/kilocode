/**
 * Tests for the /new command
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { newCommand } from "../new.js"
import type { CommandContext } from "../core/types.js"

describe("/new command", () => {
	let mockContext: CommandContext
	let clearTaskMock: ReturnType<typeof vi.fn>
	let clearMessagesMock: ReturnType<typeof vi.fn>
	let addMessageMock: ReturnType<typeof vi.fn>

	beforeEach(() => {
		// Create mock functions
		clearTaskMock = vi.fn().mockResolvedValue(undefined)
		clearMessagesMock = vi.fn()
		addMessageMock = vi.fn()

		// Create mock context
		mockContext = {
			input: "/new",
			args: [],
			options: {},
			sendMessage: vi.fn().mockResolvedValue(undefined),
			addMessage: addMessageMock,
			clearMessages: clearMessagesMock,
			clearTask: clearTaskMock,
			setMode: vi.fn(),
			exit: vi.fn(),
		}
	})

	describe("Command metadata", () => {
		it("should have correct name", () => {
			expect(newCommand.name).toBe("new")
		})

		it("should have correct aliases", () => {
			expect(newCommand.aliases).toEqual(["n", "start"])
		})

		it("should have correct description", () => {
			expect(newCommand.description).toBe("Start a new task with a clean slate")
		})

		it("should have correct category", () => {
			expect(newCommand.category).toBe("system")
		})

		it("should have correct priority", () => {
			expect(newCommand.priority).toBe(9)
		})

		it("should have correct usage", () => {
			expect(newCommand.usage).toBe("/new")
		})

		it("should have correct examples", () => {
			expect(newCommand.examples).toEqual(["/new", "/n", "/start"])
		})
	})

	describe("Command handler", () => {
		it("should call clearTask", async () => {
			await newCommand.handler(mockContext)

			expect(clearTaskMock).toHaveBeenCalledTimes(1)
		})

		it("should call clearMessages", async () => {
			await newCommand.handler(mockContext)

			expect(clearMessagesMock).toHaveBeenCalledTimes(1)
		})

		it("should add a system message", async () => {
			await newCommand.handler(mockContext)

			expect(addMessageMock).toHaveBeenCalledTimes(1)
			expect(addMessageMock).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "system",
					content: "Ready for a new task. Message history and task state cleared.",
				}),
			)
		})

		it("should call functions in correct order", async () => {
			const callOrder: string[] = []

			clearTaskMock.mockImplementation(() => {
				callOrder.push("clearTask")
				return Promise.resolve()
			})

			clearMessagesMock.mockImplementation(() => {
				callOrder.push("clearMessages")
			})

			addMessageMock.mockImplementation(() => {
				callOrder.push("addMessage")
			})

			await newCommand.handler(mockContext)

			expect(callOrder).toEqual(["clearTask", "clearMessages", "addMessage"])
		})

		it("should handle clearTask errors gracefully", async () => {
			const error = new Error("Failed to clear task")
			clearTaskMock.mockRejectedValue(error)

			await expect(newCommand.handler(mockContext)).rejects.toThrow("Failed to clear task")
		})

		it("should generate unique message IDs", async () => {
			await newCommand.handler(mockContext)
			const firstCall = addMessageMock.mock.calls[0][0]

			// Wait a bit to ensure different timestamp
			await new Promise((resolve) => setTimeout(resolve, 10))

			addMessageMock.mockClear()
			await newCommand.handler(mockContext)
			const secondCall = addMessageMock.mock.calls[0][0]

			expect(firstCall.id).not.toBe(secondCall.id)
		})

		it("should set message timestamp", async () => {
			const beforeTime = Date.now()
			await newCommand.handler(mockContext)
			const afterTime = Date.now()

			const message = addMessageMock.mock.calls[0][0]
			expect(message.ts).toBeGreaterThanOrEqual(beforeTime)
			expect(message.ts).toBeLessThanOrEqual(afterTime)
		})
	})

	describe("Integration with command system", () => {
		it("should be callable with minimal context", async () => {
			const minimalContext: CommandContext = {
				input: "/new",
				args: [],
				options: {},
				sendMessage: vi.fn().mockResolvedValue(undefined),
				addMessage: vi.fn(),
				clearMessages: vi.fn(),
				clearTask: vi.fn().mockResolvedValue(undefined),
				setMode: vi.fn(),
				exit: vi.fn(),
			}

			await expect(newCommand.handler(minimalContext)).resolves.not.toThrow()
		})

		it("should work with different input variations", async () => {
			const variations = ["/new", "/n", "/start"]

			for (const input of variations) {
				const context = { ...mockContext, input }
				clearTaskMock.mockClear()
				clearMessagesMock.mockClear()
				addMessageMock.mockClear()

				await newCommand.handler(context)

				expect(clearTaskMock).toHaveBeenCalledTimes(1)
				expect(clearMessagesMock).toHaveBeenCalledTimes(1)
				expect(addMessageMock).toHaveBeenCalledTimes(1)
			}
		})
	})
})
