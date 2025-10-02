/**
 * Hook to sync extension state changes with Jotai atoms
 * This hook listens to ExtensionService events and updates atoms accordingly
 */

import { useEffect, useCallback } from "react"
import { useSetAtom } from "jotai"
import { useExtensionService } from "./useExtensionService.js"
import { updateExtensionStateAtom, chatMessagesAtom } from "../atoms/extension.js"
import { logs } from "../../services/logs.js"

/**
 * Hook that sets up listeners for extension state changes
 * and syncs them with Jotai atoms
 */
export function useExtensionStateSync() {
	const { service, isReady } = useExtensionService()
	const updateState = useSetAtom(updateExtensionStateAtom)
	const setChatMessages = useSetAtom(chatMessagesAtom)

	// Use useCallback to ensure stable function references
	const handleStateUpdate = useCallback(
		(state: any) => {
			logs.debug("Updating state from sync hook", "useExtensionStateSync")
			// Use the updateExtensionStateAtom which handles all state updates
			updateState(state)
		},
		[updateState],
	)

	const handleMessagesUpdate = useCallback(
		(messages: any[]) => {
			logs.debug(`Direct messages update: ${messages.length} messages`, "useExtensionStateSync")
			// Force a new array reference to trigger React re-render
			setChatMessages([...messages])
		},
		[setChatMessages],
	)

	useEffect(() => {
		if (!service || !isReady) {
			return
		}

		logs.debug("Setting up extension state sync listeners", "useExtensionStateSync")

		// Listen for state changes from the extension
		const handleStateChange = (state: any) => {
			logs.debug("State change event received in hook", "useExtensionStateSync")
			logs.debug(`State has ${state.chatMessages?.length || 0} chatMessages`, "useExtensionStateSync")
			logs.debug(`State has ${state.clineMessages?.length || 0} clineMessages`, "useExtensionStateSync")

			// Update the entire state which will also update messages
			handleStateUpdate(state)

			// Also directly update messages to ensure React detects the change
			const messages = state.clineMessages || state.chatMessages || []
			if (messages.length > 0) {
				handleMessagesUpdate(messages)
			}
		}

		// Listen for general messages that might contain state
		const handleMessage = (message: any) => {
			if (message.type === "state" && message.state) {
				logs.debug("State message received in hook", "useExtensionStateSync")
				handleStateUpdate(message.state)

				// Also directly update messages
				const messages = message.state.clineMessages || message.state.chatMessages || []
				if (messages.length > 0) {
					handleMessagesUpdate(messages)
				}
			}
		}

		// Set up event listeners
		service.on("stateChange", handleStateChange)
		service.on("message", handleMessage)

		// Get initial state
		const initialState = service.getState()
		if (initialState) {
			logs.debug("Loading initial state in hook", "useExtensionStateSync")
			handleStateUpdate(initialState)

			// Also set initial messages
			const messages = initialState.clineMessages || initialState.chatMessages || []
			if (messages.length > 0) {
				handleMessagesUpdate(messages)
			}
		}

		// Cleanup
		return () => {
			logs.debug("Cleaning up extension state sync listeners", "useExtensionStateSync")
			service.off("stateChange", handleStateChange)
			service.off("message", handleMessage)
		}
	}, [service, isReady, handleStateUpdate, handleMessagesUpdate])
}
