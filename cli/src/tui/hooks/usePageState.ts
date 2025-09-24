import { useState, useEffect, useCallback } from "react"
import type { UsePageStateProps } from "../types/components.js"
import { useExtensionState } from "../context/index.js"

/**
 * Custom hook for managing common page state patterns
 * Provides consistent state management across page components
 * Now integrates with CLI context for extension state
 */
export const usePageState = <T>({ initialState, extensionState, dependencies = [] }: UsePageStateProps<T>) => {
	const [state, setState] = useState<T>(initialState)

	// Get extension state from context if not provided as prop
	const contextExtensionState = useExtensionState()
	const actualExtensionState = extensionState !== undefined ? extensionState : contextExtensionState

	// Update state when extension state or dependencies change
	useEffect(() => {
		// This effect allows pages to react to extension state changes
		// Individual pages can override this behavior by providing custom dependencies
	}, [actualExtensionState, ...dependencies])

	return [state, setState] as const
}

/**
 * Enhanced version that only uses context (no props)
 */
export const useContextPageState = <T>(initialState: T, dependencies: any[] = []) => {
	const [state, setState] = useState<T>(initialState)
	const extensionState = useExtensionState()

	// Update state when extension state or dependencies change
	useEffect(() => {
		// This effect allows pages to react to extension state changes
	}, [extensionState, ...dependencies])

	return [state, setState] as const
}

/**
 * Hook for managing loading states commonly used in pages
 */
export const useLoadingState = (initialLoading = false) => {
	const [isLoading, setIsLoading] = useState(initialLoading)
	const [error, setError] = useState<string | null>(null)

	const startLoading = useCallback(() => {
		setIsLoading(true)
		setError(null)
	}, [])

	const stopLoading = useCallback(() => {
		setIsLoading(false)
	}, [])

	const setLoadingError = useCallback((errorMessage: string) => {
		setIsLoading(false)
		setError(errorMessage)
	}, [])

	const clearError = useCallback(() => {
		setError(null)
	}, [])

	return {
		isLoading,
		error,
		startLoading,
		stopLoading,
		setLoadingError,
		clearError,
	}
}

/**
 * Hook for managing selection state in list-based components
 */
export const useSelectionState = (initialIndex = 0, maxIndex = 0) => {
	const [selectedIndex, setSelectedIndex] = useState(initialIndex)

	const selectNext = () => {
		setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
	}

	const selectPrevious = () => {
		setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
	}

	const selectIndex = (index: number) => {
		if (index >= 0 && index <= maxIndex) {
			setSelectedIndex(index)
		}
	}

	return {
		selectedIndex,
		selectNext,
		selectPrevious,
		selectIndex,
		setSelectedIndex,
	}
}
