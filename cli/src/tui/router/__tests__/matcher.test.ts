import { describe, test, expect } from "vitest"
import { RouteMatcher } from "../matcher.js"

describe("RouteMatcher", () => {
	test("matches exact routes", () => {
		const match = RouteMatcher.matchRoute("/chat", "/chat")
		expect(match).toBeTruthy()
		expect(match?.isExact).toBe(true)
		expect(match?.params).toEqual({})
	})

	test("matches routes with parameters", () => {
		const match = RouteMatcher.matchRoute("/chat/:id", "/chat/123")
		expect(match).toBeTruthy()
		expect(match?.isExact).toBe(true)
		expect(match?.params).toEqual({ id: "123" })
	})

	test("matches nested routes with parameters", () => {
		const match = RouteMatcher.matchRoute("/settings/:section", "/settings/providers")
		expect(match).toBeTruthy()
		expect(match?.isExact).toBe(true)
		expect(match?.params).toEqual({ section: "providers" })
	})

	test("does not match different routes", () => {
		const match = RouteMatcher.matchRoute("/chat", "/settings")
		expect(match).toBeNull()
	})

	test("does not match longer paths against shorter routes", () => {
		const match = RouteMatcher.matchRoute("/chat", "/chat/123")
		expect(match).toBeNull()
	})

	test("compiles path correctly", () => {
		const { regex, keys } = RouteMatcher.compilePath("/chat/:id/messages/:messageId")
		expect(keys).toEqual(["id", "messageId"])
		expect(regex.test("/chat/123/messages/456")).toBe(true)
		expect(regex.test("/chat/123")).toBe(false)
	})

	test("extracts parameters correctly", () => {
		const params = RouteMatcher.extractParams("/settings/:section", "/settings/providers")
		expect(params).toEqual({ section: "providers" })
	})
})
