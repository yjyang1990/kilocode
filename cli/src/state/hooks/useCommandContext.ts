/**
 * Hook for creating CommandContext objects
 * Encapsulates all dependencies needed for command execution
 */

import { useSetAtom, useAtomValue } from "jotai"
import { useCallback } from "react"
import type { CommandContext } from "../../commands/core/types.js"
import type { CliMessage } from "../../types/cli.js"
import { addMessageAtom, clearMessagesAtom } from "../atoms/ui.js"
import { setModeAtom } from "../atoms/config.js"
import { useWebviewMessage } from "./useWebviewMessage.js"

/**
 * Factory function type for creating CommandContext
 */
export type CommandContextFactory = (
	input: string,
	args: string[],
	options: Record<string, any>,
	onExit: () => void,
) => CommandContext

/**
 * Return type for useCommandContext hook
 */
export interface UseCommandContextReturn {
	/** Factory function to create CommandContext objects */
	createContext: CommandContextFactory
}

/**
 * Hook that provides a factory for creating CommandContext objects
 *
 * This hook encapsulates all the dependencies needed to create a CommandContext,
 * making it easier to test and reuse command execution logic.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { createContext } = useCommandContext()
 *
 *   const handleCommand = (input: string, args: string[], options: Record<string, any>) => {
 *     const context = createContext(input, args, options, onExit)
 *     await command.handler(context)
 *   }
 * }
 * ```
 */
export function useCommandContext(): UseCommandContextReturn {
	// Get atoms and hooks
	const addMessage = useSetAtom(addMessageAtom)
	const clearMessages = useSetAtom(clearMessagesAtom)
	const setMode = useSetAtom(setModeAtom)
	const { sendMessage, clearTask } = useWebviewMessage()

	// Create the factory function
	const createContext = useCallback<CommandContextFactory>(
		(input: string, args: string[], options: Record<string, any>, onExit: () => void): CommandContext => {
			return {
				input,
				args,
				options,
				sendMessage: async (message: any) => {
					await sendMessage(message)
				},
				addMessage: (message: CliMessage) => {
					addMessage(message)
				},
				clearMessages: () => {
					clearMessages()
				},
				clearTask: async () => {
					await clearTask()
				},
				setMode: async (mode: string) => {
					await setMode(mode)
				},
				exit: () => {
					onExit()
				},
			}
		},
		[addMessage, clearMessages, setMode, sendMessage, clearTask],
	)

	return { createContext }
}
