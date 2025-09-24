import { useCliContext } from "../CliContext.js"
import type { CliActions } from "../types.js"

/**
 * Hook to access the CLI actions
 * @returns The CLI actions object
 */
export const useCliActions = (): CliActions => {
	const { actions } = useCliContext()
	return actions
}
