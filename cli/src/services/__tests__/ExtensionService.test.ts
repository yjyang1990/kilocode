import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { ExtensionService, createExtensionService } from "../extension.js"
import type { ExtensionState, WebviewMessage } from "../../types/messages.js"

describe("ExtensionService", () => {
	let service: ExtensionService

	afterEach(async () => {
		if (service) {
			await service.dispose()
		}
	})

	describe("constructor", () => {
		it("should create an instance with default options", () => {
			service = new ExtensionService()
			expect(service).toBeInstanceOf(ExtensionService)
			expect(service.isReady()).toBe(false)
		})

		it("should create an instance with custom options", () => {
			service = new ExtensionService({
				workspace: "/custom/workspace",
				mode: "architect",
				autoApprove: true,
			})
			expect(service).toBeInstanceOf(ExtensionService)
		})

		it("should create an instance using factory function", () => {
			service = createExtensionService()
			expect(service).toBeInstanceOf(ExtensionService)
		})
	})

	describe("initialization", () => {
		it("should initialize successfully", async () => {
			service = new ExtensionService()

			const readyPromise = new Promise<void>((resolve) => {
				service.once("ready", () => resolve())
			})

			await service.initialize()
			await readyPromise

			expect(service.isReady()).toBe(true)
		})

		it("should not initialize twice", async () => {
			service = new ExtensionService()
			await service.initialize()

			// Second initialization should not throw
			await service.initialize()
			expect(service.isReady()).toBe(true)
		})

		it("should throw error when initializing disposed service", async () => {
			service = new ExtensionService()
			await service.dispose()

			await expect(service.initialize()).rejects.toThrow("Cannot initialize disposed ExtensionService")
		})
	})

	describe("event handling", () => {
		beforeEach(async () => {
			service = new ExtensionService()
		})

		it("should emit ready event on initialization", async () => {
			const readyHandler = vi.fn()
			service.on("ready", readyHandler)

			await service.initialize()

			expect(readyHandler).toHaveBeenCalledTimes(1)
			expect(readyHandler).toHaveBeenCalledWith(expect.any(Object))
		})

		it("should emit stateChange event when state changes", async () => {
			await service.initialize()

			const stateChangeHandler = vi.fn()
			service.on("stateChange", stateChangeHandler)

			// Trigger a state change by sending a message
			await service.sendWebviewMessage({
				type: "mode",
				text: "architect",
			})

			// Wait a bit for the state change to propagate
			await new Promise((resolve) => setTimeout(resolve, 100))

			// State change should have been emitted
			expect(stateChangeHandler).toHaveBeenCalled()
		})

		it("should emit message event for extension messages", async () => {
			await service.initialize()

			const messageHandler = vi.fn()
			service.on("message", messageHandler)

			// Send a message that will trigger a response
			await service.sendWebviewMessage({
				type: "webviewDidLaunch",
			})

			// Wait for message to be processed
			await new Promise((resolve) => setTimeout(resolve, 100))

			// Should have received at least one message
			expect(messageHandler).toHaveBeenCalled()
		})

		it("should support once listener", async () => {
			const onceHandler = vi.fn()
			service.once("ready", onceHandler)

			await service.initialize()

			// Emit ready again (shouldn't happen in practice, but testing once behavior)
			service.emit("ready", service.getExtensionAPI()!)

			expect(onceHandler).toHaveBeenCalledTimes(1)
		})

		it("should support off to remove listeners", async () => {
			const handler = vi.fn()
			service.on("message", handler)
			service.off("message", handler)

			await service.initialize()

			// Send a message
			await service.sendWebviewMessage({
				type: "webviewDidLaunch",
			})

			await new Promise((resolve) => setTimeout(resolve, 100))

			// Handler should not have been called
			expect(handler).not.toHaveBeenCalled()
		})
	})

	describe("message sending", () => {
		beforeEach(async () => {
			service = new ExtensionService()
			await service.initialize()
		})

		it("should send webview messages", async () => {
			const message: WebviewMessage = {
				type: "askResponse",
				text: "Hello",
			}

			await expect(service.sendWebviewMessage(message)).resolves.not.toThrow()
		})

		it("should throw error when sending message before initialization", async () => {
			const uninitializedService = new ExtensionService()

			await expect(uninitializedService.sendWebviewMessage({ type: "test" })).rejects.toThrow(
				"ExtensionService not initialized",
			)

			await uninitializedService.dispose()
		})

		it("should throw error when sending message after disposal", async () => {
			await service.dispose()

			await expect(service.sendWebviewMessage({ type: "test" })).rejects.toThrow(
				"Cannot send message on disposed ExtensionService",
			)
		})
	})

	describe("state management", () => {
		beforeEach(async () => {
			service = new ExtensionService()
			await service.initialize()
		})

		it("should return null state before initialization", () => {
			const uninitializedService = new ExtensionService()
			expect(uninitializedService.getState()).toBeNull()
		})

		it("should return current state after initialization", () => {
			const state = service.getState()
			expect(state).not.toBeNull()
			expect(state).toHaveProperty("version")
			expect(state).toHaveProperty("apiConfiguration")
			expect(state).toHaveProperty("chatMessages")
		})
	})

	describe("API access", () => {
		beforeEach(async () => {
			service = new ExtensionService()
			await service.initialize()
		})

		it("should provide access to message bridge", () => {
			const bridge = service.getMessageBridge()
			expect(bridge).toBeDefined()
			expect(bridge).toHaveProperty("getTUIChannel")
			expect(bridge).toHaveProperty("getExtensionChannel")
		})

		it("should provide access to extension host", () => {
			const host = service.getExtensionHost()
			expect(host).toBeDefined()
			expect(host).toHaveProperty("activate")
			expect(host).toHaveProperty("deactivate")
		})

		it("should provide access to extension API", () => {
			const api = service.getExtensionAPI()
			expect(api).not.toBeNull()
			expect(api).toHaveProperty("getState")
			expect(api).toHaveProperty("sendMessage")
			expect(api).toHaveProperty("updateState")
		})

		it("should return null API before initialization", () => {
			const uninitializedService = new ExtensionService()
			expect(uninitializedService.getExtensionAPI()).toBeNull()
		})
	})

	describe("disposal", () => {
		beforeEach(async () => {
			service = new ExtensionService()
			await service.initialize()
		})

		it("should dispose successfully", async () => {
			const disposedHandler = vi.fn()
			service.on("disposed", disposedHandler)

			await service.dispose()

			expect(service.isReady()).toBe(false)
			expect(disposedHandler).toHaveBeenCalledTimes(1)
		})

		it("should not dispose twice", async () => {
			await service.dispose()

			// Second disposal should not throw
			await expect(service.dispose()).resolves.not.toThrow()
		})

		it("should clean up all resources on disposal", async () => {
			await service.dispose()

			expect(service.isReady()).toBe(false)
			expect(service.getState()).toBeNull()
			expect(service.getExtensionAPI()).toBeNull()
		})
	})

	describe("isReady", () => {
		it("should return false before initialization", () => {
			service = new ExtensionService()
			expect(service.isReady()).toBe(false)
		})

		it("should return true after initialization", async () => {
			service = new ExtensionService()
			await service.initialize()
			expect(service.isReady()).toBe(true)
		})

		it("should return false after disposal", async () => {
			service = new ExtensionService()
			await service.initialize()
			await service.dispose()
			expect(service.isReady()).toBe(false)
		})
	})
})
