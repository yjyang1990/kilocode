import { describe, test, expect } from "vitest"
import { RouteMatcher } from "../matcher.js"

describe("Router Query Parameter Support", () => {
	test("should parse query parameters correctly", () => {
		const match = RouteMatcher.matchRoute(
			"/settings/providers/choose-model",
			"/settings/providers/choose-model?provider=kilocode&field=kilocodeModel",
		)

		expect(match).toBeTruthy()
		expect(match?.query).toEqual({
			provider: "kilocode",
			field: "kilocodeModel",
		})
		expect(match?.params).toEqual({})
		expect(match?.isExact).toBe(true)
	})

	test("should handle routes without query parameters", () => {
		const match = RouteMatcher.matchRoute("/settings", "/settings")

		expect(match).toBeTruthy()
		expect(match?.query).toEqual({})
		expect(match?.params).toEqual({})
		expect(match?.isExact).toBe(true)
	})

	test("should handle mixed path parameters and query parameters", () => {
		const match = RouteMatcher.matchRoute("/chat/:conversationId", "/chat/123?debug=true&mode=test")

		expect(match).toBeTruthy()
		expect(match?.params).toEqual({ conversationId: "123" })
		expect(match?.query).toEqual({ debug: "true", mode: "test" })
		expect(match?.isExact).toBe(true)
	})

	test("should handle URL encoding in query parameters", () => {
		const match = RouteMatcher.matchRoute("/test", "/test?message=hello%20world&special=%26%3D")

		expect(match).toBeTruthy()
		expect(match?.query).toEqual({
			message: "hello world",
			special: "&=",
		})
	})

	test("should build query strings correctly", () => {
		const queryString = RouteMatcher.buildQueryString({
			provider: "kilocode",
			field: "kilocodeModel",
		})

		expect(queryString).toBe("?provider=kilocode&field=kilocodeModel")
	})

	test("should handle empty query parameters", () => {
		const queryString = RouteMatcher.buildQueryString({})
		expect(queryString).toBe("")
	})

	test("should skip empty values in query string building", () => {
		const queryString = RouteMatcher.buildQueryString({
			provider: "kilocode",
			field: "",
			empty: null as any,
			undefined: undefined as any,
		})

		expect(queryString).toBe("?provider=kilocode")
	})

	test("should handle special characters in query parameters", () => {
		const queryString = RouteMatcher.buildQueryString({
			message: "hello world",
			special: "&=",
		})

		expect(queryString).toBe("?message=hello%20world&special=%26%3D")
	})
})
