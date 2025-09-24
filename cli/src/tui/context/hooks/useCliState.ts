import { useCliContext } from "../CliContext.js"
import type { CliState } from "../types.js"

/**
 * Hook to access the CLI state
 * @returns The current CLI state
 */
export const useCliState = (): CliState => {
	const { state } = useCliContext()
	return state
}
