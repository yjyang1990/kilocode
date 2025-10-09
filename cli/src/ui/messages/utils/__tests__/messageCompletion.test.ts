import { describe, it, expect } from "vitest"
import { isMessageComplete, splitMessages } from "../messageCompletion.js"
import type { UnifiedMessage } from "../../../../state/atoms/ui.js"
import type { CliMessage } from "../../../../types/cli.js"
import type { ExtensionChatMessage } from "../../../../types/messages.js"

describe("messageCompletion", () => {
	describe("isMessageComplete", () => {
		describe("CLI messages", () => {
			it("should return true for CLI message without partial flag", () => {
				const message: UnifiedMessage = {
					source: "cli",
					message: {
						id: "1",
						type: "user",
						content: "Hello",
						ts: Date.now(),
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})

			it("should return true for CLI message with partial=false", () => {
				const message: UnifiedMessage = {
					source: "cli",
					message: {
						id: "1",
						type: "user",
						content: "Hello",
						ts: Date.now(),
						partial: false,
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})

			it("should return false for CLI message with partial=true", () => {
				const message: UnifiedMessage = {
					source: "cli",
					message: {
						id: "1",
						type: "user",
						content: "Hello",
						ts: Date.now(),
						partial: true,
					},
				}
				expect(isMessageComplete(message)).toBe(false)
			})
		})

		describe("Extension messages - general", () => {
			it("should return false for any message with partial=true", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "text",
						text: "Hello",
						partial: true,
					},
				}
				expect(isMessageComplete(message)).toBe(false)
			})

			it("should return true for say text message without partial flag", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "text",
						text: "Hello",
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})

			it("should return true for say text message with partial=false", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "text",
						text: "Hello",
						partial: false,
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})
		})

		describe("Extension messages - api_req_started", () => {
			it("should return false for api_req_started with partial=true", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "api_req_started",
						text: "{}",
						partial: true,
					},
				}
				expect(isMessageComplete(message)).toBe(false)
			})

			it("should return false for api_req_started without completion indicators", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "api_req_started",
						text: "{}",
						partial: false,
					},
				}
				expect(isMessageComplete(message)).toBe(false)
			})

			it("should return true for api_req_started with cost", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "api_req_started",
						text: JSON.stringify({ cost: 0.001 }),
						partial: false,
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})

			it("should return true for api_req_started with streamingFailedMessage", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "api_req_started",
						text: JSON.stringify({ streamingFailedMessage: "Error occurred" }),
						partial: false,
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})

			it("should return true for api_req_started with cancelReason", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "say",
						say: "api_req_started",
						text: JSON.stringify({ cancelReason: "user_cancelled" }),
						partial: false,
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})
		})

		describe("Extension messages - ask messages", () => {
			it("should return false for ask message without isAnswered", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "ask",
						ask: "followup",
						text: "Question?",
					},
				}
				expect(isMessageComplete(message)).toBe(false)
			})

			it("should return false for ask message with isAnswered=false", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "ask",
						ask: "followup",
						text: "Question?",
						isAnswered: false,
					},
				}
				expect(isMessageComplete(message)).toBe(false)
			})

			it("should return true for ask message with isAnswered=true", () => {
				const message: UnifiedMessage = {
					source: "extension",
					message: {
						ts: Date.now(),
						type: "ask",
						ask: "followup",
						text: "Question?",
						isAnswered: true,
					},
				}
				expect(isMessageComplete(message)).toBe(true)
			})
		})
	})

	describe("splitMessages", () => {
		it("should return empty arrays for empty input", () => {
			const result = splitMessages([])
			expect(result.staticMessages).toEqual([])
			expect(result.dynamicMessages).toEqual([])
		})

		it("should put all complete messages in static", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "cli",
					message: { id: "1", type: "user", content: "Hello", ts: 1, partial: false },
				},
				{
					source: "cli",
					message: { id: "2", type: "assistant", content: "Hi", ts: 2, partial: false },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(2)
			expect(result.dynamicMessages).toHaveLength(0)
		})

		it("should put all incomplete messages in dynamic", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "cli",
					message: { id: "1", type: "user", content: "Hello", ts: 1, partial: true },
				},
				{
					source: "cli",
					message: { id: "2", type: "assistant", content: "Hi", ts: 2, partial: true },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(0)
			expect(result.dynamicMessages).toHaveLength(2)
		})

		it("should split at first incomplete message", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "cli",
					message: { id: "1", type: "user", content: "Hello", ts: 1, partial: false },
				},
				{
					source: "cli",
					message: { id: "2", type: "assistant", content: "Hi", ts: 2, partial: true },
				},
				{
					source: "cli",
					message: { id: "3", type: "user", content: "Thanks", ts: 3, partial: false },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(1)
			expect(result.dynamicMessages).toHaveLength(2)
			expect((result.staticMessages[0]?.message as CliMessage).id).toBe("1")
			expect((result.dynamicMessages[0]?.message as CliMessage).id).toBe("2")
			expect((result.dynamicMessages[1]?.message as CliMessage).id).toBe("3")
		})

		it("should handle sequential completion correctly", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "cli",
					message: { id: "1", type: "user", content: "Hello", ts: 1, partial: false },
				},
				{
					source: "cli",
					message: { id: "2", type: "assistant", content: "Hi", ts: 2, partial: false },
				},
				{
					source: "cli",
					message: { id: "3", type: "user", content: "Thanks", ts: 3, partial: false },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(3)
			expect(result.dynamicMessages).toHaveLength(0)
		})

		it("should handle mixed CLI and extension messages", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "cli",
					message: { id: "1", type: "user", content: "Hello", ts: 1, partial: false },
				},
				{
					source: "extension",
					message: { ts: 2, type: "say", say: "text", text: "Hi", partial: false },
				},
				{
					source: "cli",
					message: { id: "3", type: "user", content: "Thanks", ts: 3, partial: true },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(2)
			expect(result.dynamicMessages).toHaveLength(1)
		})

		it("should handle api_req_started completion correctly", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "extension",
					message: {
						ts: 1,
						type: "say",
						say: "api_req_started",
						text: JSON.stringify({ cost: 0.001 }),
						partial: false,
					},
				},
				{
					source: "extension",
					message: { ts: 2, type: "say", say: "text", text: "Response", partial: false },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(2)
			expect(result.dynamicMessages).toHaveLength(0)
		})

		it("should handle ask message completion correctly", () => {
			const messages: UnifiedMessage[] = [
				{
					source: "extension",
					message: { ts: 1, type: "ask", ask: "followup", text: "Question?", isAnswered: true },
				},
				{
					source: "extension",
					message: { ts: 2, type: "say", say: "text", text: "Answer", partial: false },
				},
			]
			const result = splitMessages(messages)
			expect(result.staticMessages).toHaveLength(2)
			expect(result.dynamicMessages).toHaveLength(0)
		})
	})
})
