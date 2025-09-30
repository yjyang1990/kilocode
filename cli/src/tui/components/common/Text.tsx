import React from "react"
import { Text as InkText, type TextProps } from "ink"

/**
 * Text component that ensures all children are properly wrapped for Ink rendering.
 * Automatically converts numbers and other primitives to strings to prevent Ink errors.
 */
export const Text: React.FC<TextProps> = ({ children, ...props }) => {
	// Convert children to string if it's a number or other primitive
	const safeChildren = typeof children === "number" ? String(children) : children

	return <InkText {...props}>{safeChildren}</InkText>
}
