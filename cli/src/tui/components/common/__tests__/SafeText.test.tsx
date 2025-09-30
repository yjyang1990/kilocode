import React from "react"
import { describe, it, expect } from "vitest"
import { render } from "ink-testing-library"
import { Text } from "../Text.js"

describe("Text", () => {
	it("should render string children correctly", () => {
		const { lastFrame } = render(<Text>Hello World</Text>)
		expect(lastFrame()).toBe("Hello World")
	})

	it("should convert number children to strings", () => {
		const { lastFrame } = render(<Text>{42}</Text>)
		expect(lastFrame()).toBe("42")
	})

	it("should convert zero to string", () => {
		const { lastFrame } = render(<Text>{0}</Text>)
		expect(lastFrame()).toBe("0")
	})

	it("should handle negative numbers", () => {
		const { lastFrame } = render(<Text>{-123}</Text>)
		expect(lastFrame()).toBe("-123")
	})

	it("should handle decimal numbers", () => {
		const { lastFrame } = render(<Text>{3.14}</Text>)
		expect(lastFrame()).toBe("3.14")
	})

	it("should pass through Text props", () => {
		const { lastFrame } = render(<Text color="green">{100}</Text>)
		// Ink renders colored text with ANSI codes, so we just check it contains the number
		expect(lastFrame()).toContain("100")
	})

	it("should handle template literals with numbers", () => {
		const count = 5
		const { lastFrame } = render(<Text>{count} items</Text>)
		expect(lastFrame()).toBe("5 items")
	})

	it("should handle expressions that evaluate to numbers", () => {
		const items = [1, 2, 3]
		const { lastFrame } = render(<Text>{items.length} items</Text>)
		expect(lastFrame()).toBe("3 items")
	})
})
