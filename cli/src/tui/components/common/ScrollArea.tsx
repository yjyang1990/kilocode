import { Box, DOMElement, measureElement, useFocus, useInput } from "ink"
import React, { useEffect, useReducer, useRef, useCallback, useState } from "react"

interface ScrollAreaState {
	innerHeight: number
	height: number
	scrollTop: number
	autoScroll: boolean
	prevChildrenCount: number
}

type ScrollAreaAction =
	| { type: "SET_INNER_HEIGHT"; innerHeight: number }
	| { type: "SET_HEIGHT"; height: number }
	| { type: "SCROLL_DOWN"; pixels?: number }
	| { type: "SCROLL_UP"; pixels?: number }
	| { type: "SCROLL_TO_BOTTOM" }
	| { type: "SCROLL_TO_TOP" }
	| { type: "SET_AUTO_SCROLL"; enabled: boolean }
	| { type: "UPDATE_CHILDREN_COUNT"; count: number }
	| { type: "SET_SCROLL_TOP"; scrollTop: number }

const reducer = (state: ScrollAreaState, action: ScrollAreaAction): ScrollAreaState => {
	switch (action.type) {
		case "SET_INNER_HEIGHT":
			return {
				...state,
				innerHeight: action.innerHeight,
			}
		case "SET_HEIGHT":
			return {
				...state,
				height: action.height,
			}
		case "SCROLL_DOWN": {
			const pixels = action.pixels || 1
			const maxScroll = Math.max(0, state.innerHeight - state.height)
			const newScrollTop = Math.min(maxScroll, state.scrollTop + pixels)
			// Enable auto-scroll if we've scrolled to the bottom
			const isAtBottom = newScrollTop >= maxScroll
			return {
				...state,
				scrollTop: newScrollTop,
				autoScroll: isAtBottom,
			}
		}
		case "SCROLL_UP": {
			const pixels = action.pixels || 1
			const newScrollTop = Math.max(0, state.scrollTop - pixels)
			// Disable auto-scroll when user scrolls up
			return {
				...state,
				scrollTop: newScrollTop,
				autoScroll: false,
			}
		}
		case "SCROLL_TO_BOTTOM": {
			const maxScroll = Math.max(0, state.innerHeight - state.height)
			return {
				...state,
				scrollTop: maxScroll,
				autoScroll: true,
			}
		}
		case "SCROLL_TO_TOP":
			return {
				...state,
				scrollTop: 0,
				autoScroll: false,
			}
		case "SET_AUTO_SCROLL":
			return {
				...state,
				autoScroll: action.enabled,
			}
		case "UPDATE_CHILDREN_COUNT":
			return {
				...state,
				prevChildrenCount: action.count,
			}
		case "SET_SCROLL_TOP": {
			// Clamp scroll position to valid range
			const maxScroll = Math.max(0, state.innerHeight - state.height)
			const clampedScrollTop = Math.min(maxScroll, Math.max(0, action.scrollTop))
			// If scrolling to bottom (large number), enable auto-scroll
			const isScrollingToBottom = action.scrollTop >= maxScroll || action.scrollTop > state.innerHeight
			return {
				...state,
				scrollTop: clampedScrollTop,
				autoScroll: isScrollingToBottom,
			}
		}
		default:
			return state
	}
}

export interface ScrollAreaProps extends React.PropsWithChildren {
	height: number | string
	/** Enable auto-scroll to bottom when new content is added (default: false) */
	autoScroll?: boolean
	/** Number of pixels to scroll per key press (default: 1) */
	scrollSpeed?: number
	/** Callback when scroll position changes */
	onScrollChange?: (scrollTop: number, isAtBottom: boolean) => void
	/** Whether to show border around scroll area (default: true) */
	showBorder?: boolean
	/** Border style (default: "single") */
	borderStyle?: "single" | "double" | "round" | "bold" | "singleDouble" | "doubleSingle" | "classic"
	/** Border color */
	borderColor?: string
	/** Whether this scroll area should handle input (default: true) */
	isActive?: boolean
	/** External control of scroll position */
	scrollTop?: number
	/** Whether to focus this component for keyboard input */
	isFocused?: boolean
}

export function ScrollArea({
	height,
	children,
	autoScroll: autoScrollProp = false,
	scrollSpeed = 1,
	onScrollChange,
	showBorder = true,
	borderStyle = "single",
	borderColor,
	isActive = true,
	scrollTop: externalScrollTop,
	isFocused: isFocusedProp,
}: ScrollAreaProps) {
	// Focus management for keyboard input
	const { isFocused: autoFocus } = useFocus({ isActive: isActive && isFocusedProp === undefined })
	const isFocused = isFocusedProp !== undefined ? isFocusedProp : autoFocus

	// State for dynamic height calculation
	const [calculatedHeight, setCalculatedHeight] = useState<number>(20)

	// Refs for DOM measurements
	const innerRef = useRef<DOMElement>(null)
	const containerRef = useRef<DOMElement>(null)
	const measureTimeoutRef = useRef<NodeJS.Timeout>()
	const parentMeasureTimeoutRef = useRef<NodeJS.Timeout>()

	// Calculate actual height - handle percentage strings
	const isPercentageHeight = typeof height === "string" && height.endsWith("%")
	const actualHeight = isPercentageHeight
		? calculatedHeight
		: typeof height === "string"
			? parseInt(height, 10)
			: height

	// State management
	const [state, dispatch] = useReducer(reducer, {
		height: actualHeight,
		scrollTop: 0,
		innerHeight: 0,
		autoScroll: autoScrollProp,
		prevChildrenCount: 0,
	})

	// Measure parent container for percentage heights
	const measureParentContainer = useCallback(() => {
		if (!isPercentageHeight || !containerRef.current) return

		// Clear any pending measurement
		if (parentMeasureTimeoutRef.current) {
			clearTimeout(parentMeasureTimeoutRef.current)
		}

		// Debounce parent measurements
		parentMeasureTimeoutRef.current = setTimeout(() => {
			if (!containerRef.current) return

			try {
				// Get the parent element of our container
				const parentElement = (containerRef.current as any).parentNode
				if (parentElement && typeof parentElement === "object") {
					// Try to measure the parent element
					const parentDimensions = measureElement(parentElement as DOMElement)

					// Calculate the percentage of parent height
					const percentage = parseFloat(height as string) / 100
					let newHeight = Math.floor(parentDimensions.height * percentage)

					// Account for borders if present (borders take 2 lines)
					if (showBorder) {
						newHeight = Math.max(3, newHeight - 2) // Minimum 3 to show content with border
					}

					// Ensure minimum viable height
					newHeight = Math.max(1, newHeight)

					setCalculatedHeight(newHeight)
				} else {
					// Fallback: Try to use process.stdout dimensions
					const rows = process.stdout.rows || 24
					const percentage = parseFloat(height as string) / 100

					// Estimate available height (account for other UI elements)
					// This is a rough estimate - typically header, filters, etc. take ~10 rows
					const estimatedAvailable = Math.max(10, rows - 10)
					let newHeight = Math.floor(estimatedAvailable * percentage)

					// Account for borders
					if (showBorder) {
						newHeight = Math.max(3, newHeight - 2)
					}

					setCalculatedHeight(newHeight)
				}
			} catch (error) {
				// Final fallback: use a reasonable default based on terminal size
				const rows = process.stdout.rows || 24
				const defaultHeight = Math.max(10, Math.floor(rows * 0.6)) // Use 60% of terminal height
				setCalculatedHeight(showBorder ? defaultHeight - 2 : defaultHeight)
			}
		}, 50) // Small delay to ensure parent is rendered
	}, [height, isPercentageHeight, showBorder])

	// Measure parent on mount and when height prop changes
	useEffect(() => {
		if (isPercentageHeight) {
			measureParentContainer()

			// Re-measure on terminal resize
			const handleResize = () => measureParentContainer()
			process.stdout.on("resize", handleResize)

			return () => {
				process.stdout.off("resize", handleResize)
				if (parentMeasureTimeoutRef.current) {
					clearTimeout(parentMeasureTimeoutRef.current)
				}
			}
		}
		// Return undefined when not percentage height
		return undefined
	}, [isPercentageHeight, measureParentContainer])

	// Update height when calculated or prop changes
	useEffect(() => {
		dispatch({ type: "SET_HEIGHT", height: actualHeight })
	}, [actualHeight])

	// Measure inner content height
	const measureContent = useCallback(() => {
		if (!innerRef.current) return

		// Clear any pending measurement
		if (measureTimeoutRef.current) {
			clearTimeout(measureTimeoutRef.current)
		}

		// Debounce measurements for performance
		measureTimeoutRef.current = setTimeout(() => {
			if (!innerRef.current) return

			try {
				const dimensions = measureElement(innerRef.current)
				const newHeight = dimensions.height

				// Update inner height
				dispatch({ type: "SET_INNER_HEIGHT", innerHeight: newHeight })

				// Auto-scroll to bottom if enabled
				if (state.autoScroll) {
					// Use a small additional delay to ensure the height update is processed
					setTimeout(() => {
						dispatch({ type: "SCROLL_TO_BOTTOM" })
					}, 10)
				}
			} catch (error) {
				// Fallback: count children lines
				const childCount = React.Children.count(children)
				const estimatedHeight = childCount // Each line is roughly 1 unit high
				dispatch({ type: "SET_INNER_HEIGHT", innerHeight: estimatedHeight })

				if (state.autoScroll) {
					setTimeout(() => {
						dispatch({ type: "SCROLL_TO_BOTTOM" })
					}, 10)
				}
			}
		}, 10)
	}, [state.autoScroll, children])

	// Measure content on mount and when children change
	useEffect(() => {
		measureContent()
	}, [children, measureContent])

	// Handle external scroll position control
	useEffect(() => {
		if (externalScrollTop !== undefined) {
			// Trigger a measurement before applying external scroll
			// This ensures we have accurate dimensions when scrolling
			measureContent()

			// Apply the scroll position after measurement completes
			// Account for: measureContent debounce (10ms) + scroll dispatch (10ms) + buffer (30ms)
			const timeoutId = setTimeout(() => {
				dispatch({ type: "SET_SCROLL_TOP", scrollTop: externalScrollTop })
			}, 100)

			return () => clearTimeout(timeoutId)
		}
	}, [externalScrollTop, measureContent])

	// Count children for change detection
	const childrenCount = React.Children.count(children)
	useEffect(() => {
		if (childrenCount !== state.prevChildrenCount) {
			dispatch({ type: "UPDATE_CHILDREN_COUNT", count: childrenCount })
			measureContent()

			// Auto-scroll if enabled and new content was added
			if (state.autoScroll && childrenCount > state.prevChildrenCount) {
				// Small delay to ensure content is rendered
				setTimeout(() => {
					dispatch({ type: "SCROLL_TO_BOTTOM" })
				}, 20)
			}
		}
	}, [childrenCount, state.prevChildrenCount, state.autoScroll, measureContent])

	// Notify parent of scroll changes
	useEffect(() => {
		if (onScrollChange) {
			const maxScroll = Math.max(0, state.innerHeight - state.height)
			const isAtBottom = state.scrollTop >= maxScroll
			onScrollChange(state.scrollTop, isAtBottom)
		}
	}, [state.scrollTop, state.innerHeight, state.height, onScrollChange])

	// Keyboard input handling
	useInput(
		(input, key) => {
			if (key.downArrow) {
				dispatch({ type: "SCROLL_DOWN", pixels: scrollSpeed })
			} else if (key.upArrow) {
				dispatch({ type: "SCROLL_UP", pixels: scrollSpeed })
			} else if (key.pageDown) {
				// Scroll by half the viewport height
				dispatch({ type: "SCROLL_DOWN", pixels: Math.floor(state.height / 2) })
			} else if (key.pageUp) {
				// Scroll by half the viewport height
				dispatch({ type: "SCROLL_UP", pixels: Math.floor(state.height / 2) })
			} else if (input === "e" && key.ctrl) {
				// Ctrl+E to scroll to bottom (common terminal shortcut)
				dispatch({ type: "SCROLL_TO_BOTTOM" })
			} else if (input === "a" && key.ctrl) {
				// Ctrl+A to scroll to top (common terminal shortcut)
				dispatch({ type: "SCROLL_TO_TOP" })
			}
		},
		{ isActive: isActive && isFocused },
	)

	// Calculate if scrollbar should be shown
	const canScroll = state.innerHeight > state.height
	const maxScroll = Math.max(0, state.innerHeight - state.height)

	// Debug logging
	if (process.env.NODE_ENV !== "production") {
		// console.log('ScrollArea Debug:', {
		// 	innerHeight: state.innerHeight,
		// 	viewportHeight: state.height,
		// 	scrollTop: state.scrollTop,
		// 	maxScroll,
		// 	canScroll,
		// 	childrenCount: React.Children.count(children)
		// })
	}

	// Box props for border
	const boxProps: any = {
		height: actualHeight,
		flexDirection: "column" as const,
		flexShrink: 0,
		overflow: "hidden" as const,
	}

	if (showBorder) {
		boxProps.borderStyle = borderStyle
		if (borderColor) {
			boxProps.borderColor = borderColor
		}
	}

	return (
		<Box ref={containerRef} {...boxProps}>
			<Box ref={innerRef} flexShrink={0} flexDirection="column" marginTop={-state.scrollTop}>
				{children}
			</Box>
		</Box>
	)
}

// Export a hook for external scroll control
export function useScrollArea() {
	const [scrollTop, setScrollTop] = React.useState(0)
	const [isAtBottom, setIsAtBottom] = React.useState(true)

	const scrollToBottom = useCallback(() => {
		// This will be handled by setting scrollTop to a large number
		// The ScrollArea component will clamp it to the actual max
		setScrollTop(Number.MAX_SAFE_INTEGER)
	}, [])

	const scrollToTop = useCallback(() => {
		setScrollTop(0)
	}, [])

	const handleScrollChange = useCallback((newScrollTop: number, atBottom: boolean) => {
		setScrollTop(newScrollTop)
		setIsAtBottom(atBottom)
	}, [])

	return {
		scrollTop,
		isAtBottom,
		scrollToBottom,
		scrollToTop,
		onScrollChange: handleScrollChange,
	}
}
