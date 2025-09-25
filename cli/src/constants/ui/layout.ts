/**
 * Default settings section
 */
export const DEFAULT_SECTION = "providers"

/**
 * UI layout constants
 */
export const UI_CONSTANTS = {
	/**
	 * Number of visible items in scrollable lists
	 */
	VISIBLE_ITEMS: 15,

	/**
	 * Default log count to show
	 */
	DEFAULT_LOG_COUNT: 50,

	/**
	 * Log count limits
	 */
	LOG_COUNT_MIN: 10,
	LOG_COUNT_MAX: 500,

	/**
	 * Log count adjustment step
	 */
	LOG_COUNT_STEP: 25,
} as const

/**
 * Pagination configuration
 */
export interface PaginationConfig {
	visibleItems: number
	totalItems: number
	selectedIndex: number
}

/**
 * Calculate pagination bounds
 * @param config - Pagination configuration
 * @returns Start and end indices for visible items
 */
export const calculatePaginationBounds = (config: PaginationConfig) => {
	const { visibleItems, totalItems, selectedIndex } = config

	const startIndex = Math.max(0, Math.min(selectedIndex - Math.floor(visibleItems / 2), totalItems - visibleItems))
	const endIndex = Math.min(startIndex + visibleItems, totalItems)

	return { startIndex, endIndex }
}

/**
 * Check if there are more items above/below the visible area
 * @param config - Pagination configuration
 * @returns Object indicating if there are more items above or below
 */
export const getPaginationIndicators = (config: PaginationConfig) => {
	const { startIndex, endIndex } = calculatePaginationBounds(config)

	return {
		hasItemsAbove: startIndex > 0,
		hasItemsBelow: endIndex < config.totalItems,
		currentPosition: `${config.selectedIndex + 1} of ${config.totalItems}`,
	}
}
