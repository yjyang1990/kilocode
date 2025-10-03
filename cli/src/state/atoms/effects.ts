/**
 * Effect atoms for message handling and service initialization
 * These atoms handle side effects like processing messages and initializing the service
 */

import { atom } from "jotai"
import type { ExtensionMessage } from "../../types/messages.js"
import { extensionServiceAtom, setServiceReadyAtom, setServiceErrorAtom, setIsInitializingAtom } from "./service.js"
import { updateExtensionStateAtom } from "./extension.js"
import { logs } from "../../services/logs.js"

/**
 * Message buffer to handle race conditions during initialization
 * Messages received before state is ready are buffered and processed later
 */
const messageBufferAtom = atom<ExtensionMessage[]>([])

/**
 * Flag to track if we're currently processing buffered messages
 */
const isProcessingBufferAtom = atom<boolean>(false)

/**
 * Effect atom to initialize the ExtensionService
 * This sets up event listeners and activates the service
 */
export const initializeServiceEffectAtom = atom(null, async (get, set, store?: any) => {
	const service = get(extensionServiceAtom)

	if (!service) {
		const error = new Error("ExtensionService not available for initialization")
		set(setServiceErrorAtom, error)
		throw error
	}

	// Get the store reference - if not passed, we can't update atoms from event listeners
	const atomStore = store || (get as any).store
	if (!atomStore) {
		logs.error("No store available for event listeners", "effects")
	}

	try {
		set(setIsInitializingAtom, true)
		logs.info("Initializing ExtensionService...", "effects")

		// Set up event listeners before initialization
		// IMPORTANT: Use atomStore.set() instead of set() for async event handlers
		service.on("ready", (api) => {
			logs.info("Extension ready", "effects")
			if (atomStore) {
				atomStore.set(setServiceReadyAtom, true)

				// Get initial state
				const state = api.getState()
				if (state) {
					atomStore.set(updateExtensionStateAtom, state)
				}

				// Process any buffered messages
				atomStore.set(processMessageBufferAtom)
			}
		})

		service.on("stateChange", (state) => {
			logs.debug("State change received", "effects")
			if (atomStore) {
				atomStore.set(updateExtensionStateAtom, state)
			}
		})

		service.on("message", (message) => {
			logs.debug(`Extension message received: ${message.type}`, "effects")
			if (atomStore) {
				atomStore.set(messageHandlerEffectAtom, message)
			}
		})

		service.on("error", (error) => {
			logs.error("Extension service error", "effects", { error })
			if (atomStore) {
				atomStore.set(setServiceErrorAtom, error)
			}
		})

		service.on("disposed", () => {
			logs.info("Extension service disposed", "effects")
			if (atomStore) {
				atomStore.set(setServiceReadyAtom, false)
			}
		})

		// Initialize the service
		await service.initialize()

		logs.info("ExtensionService initialized successfully", "effects")
	} catch (error) {
		logs.error("Failed to initialize ExtensionService", "effects", { error })
		const err = error instanceof Error ? error : new Error(String(error))
		set(setServiceErrorAtom, err)
		set(setIsInitializingAtom, false)
		throw err
	}
})

/**
 * Effect atom to handle incoming extension messages
 * This processes messages and updates state accordingly
 */
export const messageHandlerEffectAtom = atom(null, (get, set, message: ExtensionMessage) => {
	try {
		// Check if service is ready
		const service = get(extensionServiceAtom)
		if (!service) {
			logs.warn("Message received but service not available, buffering", "effects")
			const buffer = get(messageBufferAtom)
			set(messageBufferAtom, [...buffer, message])
			return
		}

		// Handle different message types
		switch (message.type) {
			case "state":
				if (message.state) {
					set(updateExtensionStateAtom, message.state)
				}
				break

			case "action":
				logs.debug(`Processing action message: ${message.action}`, "effects")
				// Action messages are typically handled by the UI
				break

			case "partialMessage":
				logs.debug("Processing partial message", "effects")
				// Partial messages update the current message being streamed
				break

			case "invoke":
				logs.debug("Processing invoke message", "effects")
				// Invoke messages trigger specific UI actions
				break

			default:
				logs.debug(`Unhandled message type: ${message.type}`, "effects")
		}
	} catch (error) {
		logs.error("Error handling extension message", "effects", { error, message })
	}
})

/**
 * Effect atom to process buffered messages
 * This is called after the service becomes ready
 */
export const processMessageBufferAtom = atom(null, (get, set) => {
	// Prevent concurrent processing
	if (get(isProcessingBufferAtom)) {
		return
	}

	const buffer = get(messageBufferAtom)
	if (buffer.length === 0) {
		return
	}

	try {
		set(isProcessingBufferAtom, true)
		logs.info(`Processing ${buffer.length} buffered messages`, "effects")

		// Process each buffered message
		for (const message of buffer) {
			set(messageHandlerEffectAtom, message)
		}

		// Clear the buffer
		set(messageBufferAtom, [])
		logs.info("Buffered messages processed", "effects")
	} catch (error) {
		logs.error("Error processing message buffer", "effects", { error })
	} finally {
		set(isProcessingBufferAtom, false)
	}
})

/**
 * Effect atom to dispose the service
 * This cleans up resources and removes event listeners
 */
export const disposeServiceEffectAtom = atom(null, async (get, set) => {
	const service = get(extensionServiceAtom)

	if (!service) {
		logs.warn("No service to dispose", "effects")
		return
	}

	try {
		logs.info("Disposing ExtensionService...", "effects")

		// Clear any buffered messages
		set(messageBufferAtom, [])

		// Dispose the service
		await service.dispose()

		// Clear state
		set(updateExtensionStateAtom, null)
		set(setServiceReadyAtom, false)

		logs.info("ExtensionService disposed successfully", "effects")
	} catch (error) {
		logs.error("Error disposing ExtensionService", "effects", { error })
		const err = error instanceof Error ? error : new Error(String(error))
		set(setServiceErrorAtom, err)
		throw err
	}
})

/**
 * Derived atom to get the message buffer size
 * Useful for debugging and monitoring
 */
export const messageBufferSizeAtom = atom<number>((get) => {
	const buffer = get(messageBufferAtom)
	return buffer.length
})

/**
 * Derived atom to check if there are buffered messages
 */
export const hasBufferedMessagesAtom = atom<boolean>((get) => {
	return get(messageBufferSizeAtom) > 0
})

/**
 * Action atom to clear the message buffer
 * Useful for error recovery
 */
export const clearMessageBufferAtom = atom(null, (get, set) => {
	const bufferSize = get(messageBufferSizeAtom)
	if (bufferSize > 0) {
		logs.warn(`Clearing ${bufferSize} buffered messages`, "effects")
		set(messageBufferAtom, [])
	}
})
