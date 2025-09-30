import { describe, it, expect } from "vitest"
import { render } from "ink-testing-library"
import { Box } from "ink"
import { ScrollArea, useScrollArea } from "../ScrollArea.js"
import { Text } from "../Text.js"

describe("ScrollArea", () => {
	it("should render children content", () => {
		const { lastFrame } = render(
			<ScrollArea height={5}>
				<Text>Line 1</Text>
				<Text>Line 2</Text>
				<Text>Line 3</Text>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("Line 1")
		expect(lastFrame()).toContain("Line 2")
		expect(lastFrame()).toContain("Line 3")
	})

	it("should handle height prop correctly", () => {
		const { lastFrame } = render(
			<ScrollArea height={10}>
				<Text>Content</Text>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("Content")
	})

	it("should render with border when showBorder is true", () => {
		const { lastFrame } = render(
			<ScrollArea height={5} showBorder={true} borderStyle="single">
				<Text>Content with border</Text>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("Content with border")
		// Border characters should be present
		expect(lastFrame()).toMatch(/[─│┌┐└┘]/)
	})

	it("should render without border when showBorder is false", () => {
		const { lastFrame } = render(
			<ScrollArea height={5} showBorder={false}>
				<Text>Content without border</Text>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("Content without border")
		// Border characters should not be present
		expect(lastFrame()).not.toMatch(/[─│┌┐└┘]/)
	})

	it("should handle multiple children", () => {
		const { lastFrame } = render(
			<ScrollArea height={10}>
				<Box flexDirection="column">
					<Text>First message</Text>
					<Text>Second message</Text>
					<Text>Third message</Text>
					<Text>Fourth message</Text>
					<Text>Fifth message</Text>
				</Box>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("First message")
		expect(lastFrame()).toContain("Second message")
		expect(lastFrame()).toContain("Third message")
	})

	it("should handle empty children gracefully", () => {
		const { lastFrame } = render(<ScrollArea height={5} />)

		// Should render without crashing
		expect(lastFrame()).toBeDefined()
	})

	describe("useScrollArea hook", () => {
		it("should provide scroll control functions", () => {
			let hookResult: ReturnType<typeof useScrollArea> | undefined

			const TestComponent = () => {
				hookResult = useScrollArea()
				return <Text>Test</Text>
			}

			render(<TestComponent />)

			expect(hookResult).toBeDefined()
			if (hookResult) {
				expect(hookResult.scrollTop).toBe(0)
				expect(hookResult.isAtBottom).toBe(true)
				expect(typeof hookResult.scrollToBottom).toBe("function")
				expect(typeof hookResult.scrollToTop).toBe("function")
				expect(typeof hookResult.onScrollChange).toBe("function")
			}
		})
	})

	it("should handle autoScroll prop", () => {
		const { lastFrame } = render(
			<ScrollArea height={5} autoScroll={true}>
				<Text>Message 1</Text>
				<Text>Message 2</Text>
				<Text>Message 3</Text>
			</ScrollArea>,
		)

		// Content should be visible
		expect(lastFrame()).toContain("Message 1")
	})

	it("should handle scrollSpeed prop", () => {
		const { lastFrame } = render(
			<ScrollArea height={5} scrollSpeed={3}>
				<Text>Fast scrolling content</Text>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("Fast scrolling content")
	})

	it("should handle custom border color", () => {
		const { lastFrame } = render(
			<ScrollArea height={5} showBorder={true} borderColor="blue">
				<Text>Content with colored border</Text>
			</ScrollArea>,
		)

		expect(lastFrame()).toContain("Content with colored border")
	})
})
