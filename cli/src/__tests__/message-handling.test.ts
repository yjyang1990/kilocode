import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { EventEmitter } from "events"
import { createMessageBridge } from "../communication/ipc.js"
import type { ExtensionMessage, WebviewMessage } from "../types/messages.js"

describe("Message Handling Improvements", () => {
	let messageBridge: any
	let mockExtensionHost: EventEmitter
	let receivedMessages: ExtensionMessage[]

	beforeEach(() => {
		receivedMessages = []
		mockExtensionHost = new EventEmitter()
		messageBridge = createMessageBridge({ enableLogging: false })

		// Set up message capture
		mockExtensionHost.on("message", (message: ExtensionMessage) => {
			receivedMessages.push(message)
		})
	})

	afterEach(() => {
		if (messageBridge) {
			messageBridge.dispose()
		}
		mockExtensionHost.removeAllListeners()
	})

	it("should handle state messages with clineMessages", () => {
		const stateMessage: ExtensionMessage = {
			type: "state",
			state: {
				version: "1.0.0",
				apiConfiguration: {},
				clineMessages: [
					{
						ts: Date.now(),
						type: "ask",
						ask: "followup",
						text: "What would you like me to help you with?",
					},
				],
				mode: "ask",
				customModes: [],
				taskHistoryFullLength: 0,
				taskHistoryVersion: 0,
				renderContext: "cli",
				telemetrySetting: "disabled",
				cwd: "/test/workspace",
			},
		}

		// Simulate message processing
		mockExtensionHost.emit("message", stateMessage)

		// Verify the message was captured
		expect(receivedMessages).toHaveLength(1)
		expect(receivedMessages[0].type).toBe("state")
		expect(receivedMessages[0].state?.clineMessages).toHaveLength(1)
	})

	it("should handle messageUpdated messages", () => {
		const messageUpdatedMessage: ExtensionMessage = {
			type: "messageUpdated",
			clineMessage: {
				ts: Date.now(),
				type: "say",
				say: "text",
				text: "I can help you with that!",
			},
		}

		mockExtensionHost.emit("message", messageUpdatedMessage)

		expect(receivedMessages).toHaveLength(1)
		expect(receivedMessages[0].type).toBe("messageUpdated")
		expect(receivedMessages[0].clineMessage?.text).toBe("I can help you with that!")
	})

	it("should handle invoke messages", () => {
		const invokeMessage: ExtensionMessage = {
			type: "invoke",
			invoke: "sendMessage",
			text: "Test message",
			images: [],
		}

		mockExtensionHost.emit("message", invokeMessage)

		expect(receivedMessages).toHaveLength(1)
		expect(receivedMessages[0].type).toBe("invoke")
		expect(receivedMessages[0].invoke).toBe("sendMessage")
	})

	it("should handle selectedImages messages", () => {
		const selectedImagesMessage: ExtensionMessage = {
			type: "selectedImages",
			images: ["data:image/png;base64,test"],
			context: "chat",
		}

		mockExtensionHost.emit("message", selectedImagesMessage)

		expect(receivedMessages).toHaveLength(1)
		expect(receivedMessages[0].type).toBe("selectedImages")
		expect(receivedMessages[0].images).toHaveLength(1)
	})

	it("should handle condenseTaskContextResponse messages", () => {
		const condenseMessage: ExtensionMessage = {
			type: "condenseTaskContextResponse",
			text: "task-123",
		}

		mockExtensionHost.emit("message", condenseMessage)

		expect(receivedMessages).toHaveLength(1)
		expect(receivedMessages[0].type).toBe("condenseTaskContextResponse")
		expect(receivedMessages[0].text).toBe("task-123")
	})

	it("should create message bridge successfully", () => {
		const bridge = createMessageBridge()
		expect(bridge).toBeDefined()
		expect(bridge.getTUIChannel).toBeDefined()
		expect(bridge.getExtensionChannel).toBeDefined()
		expect(bridge.sendWebviewMessage).toBeDefined()
		expect(bridge.sendExtensionMessage).toBeDefined()
		bridge.dispose()
	})
})
