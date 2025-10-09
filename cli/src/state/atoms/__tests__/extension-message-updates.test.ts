/**
 * Tests for extension message update logic
 * Specifically testing the deduplication logic in updateChatMessageByTsAtom
 */

import { describe, it, expect, beforeEach } from "vitest"
import { createStore } from "jotai"
import { chatMessagesAtom, updateChatMessageByTsAtom, updateChatMessagesAtom } from "../extension.js"
import type { ExtensionChatMessage } from "../../../types/messages.js"

describe("updateChatMessageByTsAtom", () => {
	let store: ReturnType<typeof createStore>

	beforeEach(() => {
		store = createStore()
	})

	it("should update existing message by timestamp", () => {
		// Setup: Add initial message
		const initialMessage: ExtensionChatMessage = {
			ts: 1000,
			type: "say",
			say: "text",
			text: "Initial text",
			partial: false,
		}
		store.set(updateChatMessagesAtom, [initialMessage])

		// Update the message
		const updatedMessage: ExtensionChatMessage = {
			ts: 1000,
			type: "say",
			say: "text",
			text: "Updated text",
			partial: false,
		}
		store.set(updateChatMessageByTsAtom, updatedMessage)

		// Verify: Should have one message with updated text
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.text).toBe("Updated text")
	})

	it("should update last partial message when streaming with same type/subtype", () => {
		// Setup: Add partial message
		const partialMessage: ExtensionChatMessage = {
			ts: 1000,
			type: "say",
			say: "text",
			text: "Hello",
			partial: true,
		}
		store.set(updateChatMessagesAtom, [partialMessage])

		// Send update with different timestamp but same type/subtype
		const streamUpdate: ExtensionChatMessage = {
			ts: 1001, // Different timestamp
			type: "say",
			say: "text",
			text: "Hello, world!",
			partial: true,
		}
		store.set(updateChatMessageByTsAtom, streamUpdate)

		// Verify: Should still have one message (updated, not duplicated)
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.text).toBe("Hello, world!")
		expect(messages[0]?.ts).toBe(1001)
	})

	it("should ignore new message when type/subtype differs (not a streaming update)", () => {
		// Setup: Add initial message
		const initialMessage: ExtensionChatMessage = {
			ts: 1000,
			type: "say",
			say: "text",
			text: "First message",
			partial: false,
		}
		store.set(updateChatMessagesAtom, [initialMessage])

		// Try to add different type message via messageUpdated (should be ignored)
		const newMessage: ExtensionChatMessage = {
			ts: 1001,
			type: "say",
			say: "api_req_started",
			text: "API request started",
			partial: false,
		}
		store.set(updateChatMessageByTsAtom, newMessage)

		// Verify: Should still have one message (new message ignored, will come via state update)
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.text).toBe("First message")
	})

	it("should ignore new message when last message is not partial", () => {
		// Setup: Add complete (non-partial) message
		const completeMessage: ExtensionChatMessage = {
			ts: 1000,
			type: "say",
			say: "text",
			text: "Complete message",
			partial: false,
		}
		store.set(updateChatMessagesAtom, [completeMessage])

		// Try to add another message with same type/subtype (should be ignored)
		const newMessage: ExtensionChatMessage = {
			ts: 1001,
			type: "say",
			say: "text",
			text: "New message",
			partial: false,
		}
		store.set(updateChatMessageByTsAtom, newMessage)

		// Verify: Should still have one message (new message ignored, will come via state update)
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.text).toBe("Complete message")
	})

	it("should handle rapid streaming updates correctly", () => {
		// Setup: Add initial message via state
		const initialMessage: ExtensionChatMessage = {
			ts: 1000,
			type: "say",
			say: "text",
			text: "H",
			partial: true,
		}
		store.set(updateChatMessagesAtom, [initialMessage])

		// Simulate rapid streaming updates with different timestamps
		const updates: ExtensionChatMessage[] = [
			{ ts: 1001, type: "say", say: "text", text: "He", partial: true },
			{ ts: 1002, type: "say", say: "text", text: "Hel", partial: true },
			{ ts: 1003, type: "say", say: "text", text: "Hell", partial: true },
			{ ts: 1004, type: "say", say: "text", text: "Hello", partial: false },
		]

		// Apply all updates (they should update the last message since it's partial and same type/subtype)
		for (const update of updates) {
			store.set(updateChatMessageByTsAtom, update)
		}

		// Verify: Should have only one message with final text
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.text).toBe("Hello")
		expect(messages[0]?.partial).toBe(false)
	})

	it("should handle ask messages correctly", () => {
		// Setup: Add partial ask message
		const partialAsk: ExtensionChatMessage = {
			ts: 1000,
			type: "ask",
			ask: "followup",
			text: "What would you like",
			partial: true,
		}
		store.set(updateChatMessagesAtom, [partialAsk])

		// Update with same ask type
		const updatedAsk: ExtensionChatMessage = {
			ts: 1001,
			type: "ask",
			ask: "followup",
			text: "What would you like to do next?",
			partial: false,
		}
		store.set(updateChatMessageByTsAtom, updatedAsk)

		// Verify: Should have one message (updated)
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.text).toBe("What would you like to do next?")
	})

	it("should ignore update when ask subtype differs", () => {
		// Setup: Add partial ask message
		const partialAsk: ExtensionChatMessage = {
			ts: 1000,
			type: "ask",
			ask: "followup",
			text: "Question 1",
			partial: true,
		}
		store.set(updateChatMessagesAtom, [partialAsk])

		// Try to add different ask subtype (should be ignored)
		const differentAsk: ExtensionChatMessage = {
			ts: 1001,
			type: "ask",
			ask: "completion_result",
			text: "Question 2",
			partial: false,
		}
		store.set(updateChatMessageByTsAtom, differentAsk)

		// Verify: Should still have one message (different subtype ignored, will come via state update)
		const messages = store.get(chatMessagesAtom)
		expect(messages).toHaveLength(1)
		expect(messages[0]?.ask).toBe("followup")
	})
})
