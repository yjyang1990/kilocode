/**
 * Extension state atoms for managing ExtensionState and related data
 */

import { atom } from "jotai"
import type {
	ExtensionState,
	ExtensionChatMessage,
	HistoryItem,
	TodoItem,
	RouterModels,
	ProviderSettings,
	McpServer,
} from "../../types/messages.js"
import { logs } from "../../services/logs.js"

/**
 * Atom to hold the complete ExtensionState
 * This is the primary state object received from the extension
 */
export const extensionStateAtom = atom<ExtensionState | null>(null)

/**
 * Atom to hold the message history (chatMessages)
 * Extracted from ExtensionState for easier access
 */
export const chatMessagesAtom = atom<ExtensionChatMessage[]>([])

/**
 * Atom to track message versions (content length) for reconciliation
 * Maps message timestamp to content length to determine which version is newer
 */
export const messageVersionMapAtom = atom<Map<number, number>>(new Map<number, number>())

/**
 * Atom to track actively streaming messages
 * Messages in this set are protected from being overwritten by state updates
 */
export const streamingMessagesSetAtom = atom<Set<number>>(new Set<number>())

/**
 * Atom to hold the current task item
 */
export const currentTaskAtom = atom<HistoryItem | null>(null)

/**
 * Atom to hold the current task's todo list
 */
export const taskTodosAtom = atom<TodoItem[]>([])

/**
 * Atom to hold available router models
 */
export const routerModelsAtom = atom<RouterModels | null>(null)

/**
 * Atom to hold the current API configuration
 */
export const apiConfigurationAtom = atom<ProviderSettings | null>(null)

/**
 * Atom to hold the current mode
 */
export const extensionModeAtom = atom<string>("code")

/**
 * Atom to hold custom modes
 */
export const customModesAtom = atom<any[]>([])

/**
 * Atom to hold MCP servers configuration
 */
export const mcpServersAtom = atom<McpServer[]>([])

/**
 * Atom to hold the current working directory
 */
export const cwdAtom = atom<string | null>(null)

/**
 * Derived atom to get the extension version
 */
export const extensionVersionAtom = atom<string>((get) => {
	const state = get(extensionStateAtom)
	return state?.version || "unknown"
})

/**
 * Derived atom to get the current API config name
 */
export const currentApiConfigNameAtom = atom<string | null>((get) => {
	const state = get(extensionStateAtom)
	return state?.currentApiConfigName || null
})

/**
 * Derived atom to get the list of API config metadata
 */
export const listApiConfigMetaAtom = atom((get) => {
	const state = get(extensionStateAtom)
	return state?.listApiConfigMeta || []
})

/**
 * Derived atom to get task history length
 */
export const taskHistoryLengthAtom = atom<number>((get) => {
	const state = get(extensionStateAtom)
	return state?.taskHistoryFullLength || 0
})

/**
 * Derived atom to get the render context
 */
export const renderContextAtom = atom<"sidebar" | "editor" | "cli">((get) => {
	const state = get(extensionStateAtom)
	return state?.renderContext || "cli"
})

/**
 * Derived atom to check if there are any messages
 */
export const hasChatMessagesAtom = atom<boolean>((get) => {
	const messages = get(chatMessagesAtom)
	return messages.length > 0
})

/**
 * Derived atom to get the last message
 */
export const lastChatMessageAtom = atom<ExtensionChatMessage | null>((get) => {
	const messages = get(chatMessagesAtom)
	return messages.length > 0 ? (messages[messages.length - 1] ?? null) : null
})

/**
 * Derived atom to check if there's an active task
 */
export const hasActiveTaskAtom = atom<boolean>((get) => {
	const task = get(currentTaskAtom)
	return task !== null
})

/**
 * Derived atom to get pending todos count
 */
export const pendingTodosCountAtom = atom<number>((get) => {
	const todos = get(taskTodosAtom)
	return todos.filter((todo) => todo.status === "pending").length
})

/**
 * Derived atom to get completed todos count
 */
export const completedTodosCountAtom = atom<number>((get) => {
	const todos = get(taskTodosAtom)
	return todos.filter((todo) => todo.status === "completed").length
})

/**
 * Derived atom to get in-progress todos count
 */
export const inProgressTodosCountAtom = atom<number>((get) => {
	const todos = get(taskTodosAtom)
	return todos.filter((todo) => todo.status === "in_progress").length
})

/**
 * Action atom to update the complete extension state
 * This syncs all derived atoms with the new state
 * Uses intelligent message reconciliation to prevent flickering during streaming
 */
export const updateExtensionStateAtom = atom(null, (get, set, state: ExtensionState | null) => {
	const currentRouterModels = get(routerModelsAtom)
	const currentMessages = get(chatMessagesAtom)
	const versionMap = get(messageVersionMapAtom)
	const streamingSet = get(streamingMessagesSetAtom)

	logs.debug(
		`[STATE UPDATE] Received state update with ${state?.clineMessages?.length || state?.chatMessages?.length || 0} messages`,
		"extension",
	)
	logs.debug(
		`[STATE UPDATE] Current state: ${currentMessages.length} messages, ${streamingSet.size} streaming`,
		"extension",
	)

	set(extensionStateAtom, state)

	if (state) {
		// Get incoming messages from state
		const incomingMessages = state.clineMessages || state.chatMessages || []

		logs.debug(
			`[STATE UPDATE] Incoming messages: ${incomingMessages.map((m) => `ts=${m.ts} type=${m.type} partial=${m.partial} len=${getMessageContentLength(m)}`).join(", ")}`,
			"extension",
		)

		// Reconcile with current messages to preserve streaming state
		const reconciledMessages = reconcileMessages(currentMessages, incomingMessages, versionMap, streamingSet)

		logs.debug(`[STATE UPDATE] After reconciliation: ${reconciledMessages.length} messages`, "extension")

		set(chatMessagesAtom, reconciledMessages)

		// Update version map for all reconciled messages
		const newVersionMap = new Map<number, number>()
		reconciledMessages.forEach((msg) => {
			const version = getMessageContentLength(msg)
			newVersionMap.set(msg.ts, version)
		})
		set(messageVersionMapAtom, newVersionMap)

		// Update streaming set based on reconciled messages
		const newStreamingSet = new Set<number>()
		reconciledMessages.forEach((msg) => {
			if (msg.partial) {
				newStreamingSet.add(msg.ts)
			}
		})
		set(streamingMessagesSetAtom, newStreamingSet)

		// Sync other derived atoms
		set(currentTaskAtom, state.currentTaskItem || null)
		set(taskTodosAtom, state.currentTaskTodos || [])
		// Preserve existing routerModels if not provided in new state
		set(routerModelsAtom, state.routerModels || currentRouterModels)
		set(apiConfigurationAtom, state.apiConfiguration || null)
		set(extensionModeAtom, state.mode || "code")
		set(customModesAtom, state.customModes || [])
		set(mcpServersAtom, state.mcpServers || [])
		set(cwdAtom, state.cwd || null)
	} else {
		// Clear all derived atoms
		set(chatMessagesAtom, [])
		set(currentTaskAtom, null)
		set(taskTodosAtom, [])
		set(routerModelsAtom, null)
		set(apiConfigurationAtom, null)
		set(extensionModeAtom, "code")
		set(customModesAtom, [])
		set(mcpServersAtom, [])
		set(cwdAtom, null)
		// Clear version tracking
		set(messageVersionMapAtom, new Map<number, number>())
		set(streamingMessagesSetAtom, new Set<number>())
	}
})

/**
 * Action atom to update only the messages
 * Useful for incremental message updates
 */
export const updateChatMessagesAtom = atom(null, (get, set, messages: ExtensionChatMessage[]) => {
	set(chatMessagesAtom, messages)

	// Update the state atom if it exists
	const state = get(extensionStateAtom)
	if (state) {
		set(extensionStateAtom, {
			...state,
			chatMessages: messages,
		})
	}
})

/**
 * Action atom to add a single message
 */
export const addChatMessageAtom = atom(null, (get, set, message: ExtensionChatMessage) => {
	const messages = get(chatMessagesAtom)
	set(updateChatMessagesAtom, [...messages, message])
})

/**
 * Action atom to update a single message by timestamp
 * Used for incremental message updates during streaming
 *
 * This function handles message updates with version checking and streaming protection:
 * 1. Finds existing message by timestamp
 * 2. If not found, checks if it's a streaming update to the last message (different timestamp but same type/subtype)
 * 3. Checks if the update is newer (longer content) than existing version
 * 4. Tracks streaming state to protect partial messages
 * 5. Updates existing message or ignores if not found and not a streaming update
 */
export const updateChatMessageByTsAtom = atom(null, (get, set, updatedMessage: ExtensionChatMessage) => {
	const messages = get(chatMessagesAtom)
	const versionMap = get(messageVersionMapAtom)
	const streamingSet = get(streamingMessagesSetAtom)

	logs.debug(
		`[MESSAGE UPDATE] Received update for ts=${updatedMessage.ts} type=${updatedMessage.type} partial=${updatedMessage.partial} len=${getMessageContentLength(updatedMessage)}`,
		"extension",
	)
	logs.debug(`[MESSAGE UPDATE] Current messages: ${messages.map((m) => `ts=${m.ts}`).join(", ")}`, "extension")
	logs.debug(`[MESSAGE UPDATE] Streaming set: ${Array.from(streamingSet).join(", ")}`, "extension")

	// Find the message by timestamp (using findLastIndex to match webview behavior)
	let messageIndex = -1
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i]?.ts === updatedMessage.ts) {
			messageIndex = i
			break
		}
	}

	logs.debug(`[MESSAGE UPDATE] Found message at index ${messageIndex}`, "extension")

	// If message not found by timestamp, check if this is a streaming update to the last message
	// This handles cases where timestamps might differ slightly during rapid updates
	// ONLY do this if the last message is partial (actively streaming)
	if (messageIndex === -1 && messages.length > 0) {
		const lastMessage = messages[messages.length - 1]

		// Check if this update belongs to the last message based on type and subtype
		const isSameType = lastMessage?.type === updatedMessage.type
		const isSameSubtype =
			(lastMessage?.type === "say" && lastMessage?.say === updatedMessage.say) ||
			(lastMessage?.type === "ask" && lastMessage?.ask === updatedMessage.ask)

		// Only treat as update if last message is partial AND types match
		// This prevents incorrectly merging completed messages
		if (lastMessage?.partial && isSameType && isSameSubtype) {
			messageIndex = messages.length - 1
			logs.debug(
				`[MESSAGE UPDATE] Treating ts=${updatedMessage.ts} as update to last message ts=${lastMessage.ts} (type/subtype match, last was partial)`,
				"extension",
			)
		} else {
			logs.debug(
				`[MESSAGE UPDATE] NOT treating as update to last message: partial=${lastMessage?.partial} sameType=${isSameType} sameSubtype=${isSameSubtype}`,
				"extension",
			)
		}
	}

	// If still not found, ignore the update (it will come through state update)
	if (messageIndex === -1) {
		logs.debug(
			`[MESSAGE UPDATE] Ignoring messageUpdated for non-existent message ts=${updatedMessage.ts} (will come through state update)`,
			"extension",
		)
		return
	}

	// Calculate content length as version
	const newVersion = getMessageContentLength(updatedMessage)
	const existingMessage = messages[messageIndex]
	const currentVersion = versionMap.get(existingMessage!.ts) || 0

	// Only update if new version is greater, OR if it's a partial message (streaming)
	// Partial messages always update to show streaming progress
	if (newVersion < currentVersion && !updatedMessage.partial) {
		logs.debug(
			`[MESSAGE UPDATE] Skipping outdated message update for ts=${updatedMessage.ts} (version ${newVersion} < ${currentVersion})`,
			"extension",
		)
		return
	}

	logs.debug(
		`[MESSAGE UPDATE] Accepting update: newVersion=${newVersion} currentVersion=${currentVersion} partial=${updatedMessage.partial}`,
		"extension",
	)

	// Update version tracking (use the updated message's timestamp)
	const newVersionMap = new Map(versionMap)
	newVersionMap.set(updatedMessage.ts, newVersion)
	set(messageVersionMapAtom, newVersionMap)

	// Track streaming state (use the updated message's timestamp)
	const newStreamingSet = new Set(streamingSet)
	if (updatedMessage.partial) {
		newStreamingSet.add(updatedMessage.ts)
		logs.debug(`[MESSAGE UPDATE] Message ts=${updatedMessage.ts} is now streaming`, "extension")
	} else {
		newStreamingSet.delete(updatedMessage.ts)
		if (streamingSet.has(updatedMessage.ts)) {
			logs.debug(`[MESSAGE UPDATE] Message ts=${updatedMessage.ts} streaming completed`, "extension")
		}
	}
	set(streamingMessagesSetAtom, newStreamingSet)

	// Update existing message
	const newMessages = [...messages]
	newMessages[messageIndex] = updatedMessage
	set(updateChatMessagesAtom, newMessages)
	logs.debug(
		`[MESSAGE UPDATE] Updated existing message ts=${updatedMessage.ts} (version ${newVersion}) - Total messages now: ${newMessages.length}`,
		"extension",
	)
})

/**
 * Action atom to update the current task
 */
export const updateCurrentTaskAtom = atom(null, (get, set, task: HistoryItem | null) => {
	set(currentTaskAtom, task)

	// Update the state atom if it exists
	const state = get(extensionStateAtom)
	if (state) {
		const updatedState: ExtensionState = {
			...state,
		}
		if (task) {
			updatedState.currentTaskItem = task
		} else {
			delete updatedState.currentTaskItem
		}
		set(extensionStateAtom, updatedState)
	}
})

/**
 * Action atom to update task todos
 */
export const updateTaskTodosAtom = atom(null, (get, set, todos: TodoItem[]) => {
	set(taskTodosAtom, todos)

	// Update the state atom if it exists
	const state = get(extensionStateAtom)
	if (state) {
		set(extensionStateAtom, {
			...state,
			currentTaskTodos: todos,
		})
	}
})

/**
 * Action atom to update router models
 */
export const updateRouterModelsAtom = atom(null, (get, set, models: RouterModels | null) => {
	set(routerModelsAtom, models)

	// Update the state atom if it exists
	const state = get(extensionStateAtom)
	if (state) {
		const updatedState: ExtensionState = {
			...state,
		}
		if (models) {
			updatedState.routerModels = models
		} else {
			delete updatedState.routerModels
		}
		set(extensionStateAtom, updatedState)
	}
})

/**
 * Action atom to update the mode
 */
export const updateExtensionModeAtom = atom(null, (get, set, mode: string) => {
	set(extensionModeAtom, mode)

	// Update the state atom if it exists
	const state = get(extensionStateAtom)
	if (state) {
		set(extensionStateAtom, {
			...state,
			mode,
		})
	}
})

/**
 * Action atom to update extension state with partial updates
 * Merges the partial state with the current state
 */
export const updatePartialExtensionStateAtom = atom(null, (get, set, partialState: Partial<ExtensionState>) => {
	const currentState = get(extensionStateAtom)
	if (currentState) {
		set(updateExtensionStateAtom, {
			...currentState,
			...partialState,
		})
	} else {
		// If no current state, we need to create a minimal valid state
		const minimalState: ExtensionState = {
			version: "1.0.0",
			apiConfiguration: {},
			chatMessages: [],
			mode: "code",
			customModes: [],
			taskHistoryFullLength: 0,
			taskHistoryVersion: 0,
			renderContext: "cli",
			telemetrySetting: "disabled",
			...partialState,
		}
		set(updateExtensionStateAtom, minimalState)
	}
})

/**
 * Action atom to clear all extension state
 */
export const clearExtensionStateAtom = atom(null, (get, set) => {
	set(updateExtensionStateAtom, null)
	// Clear version tracking
	set(messageVersionMapAtom, new Map<number, number>())
	set(streamingMessagesSetAtom, new Set<number>())
})

/**
 * Helper function to calculate message content length for versioning
 * Used to determine which version of a message is newer
 */
function getMessageContentLength(msg: ExtensionChatMessage): number {
	let length = 0
	if (msg.text) length += msg.text.length
	if (msg.say) length += msg.say.length
	if (msg.ask) length += msg.ask.length
	return length
}

/**
 * Helper function to reconcile messages from state updates with existing messages
 * Simplified approach matching webview behavior - trusts the extension to send correct state
 */
function reconcileMessages(
	current: ExtensionChatMessage[],
	incoming: ExtensionChatMessage[],
	versionMap: Map<number, number>,
	streamingSet: Set<number>,
): ExtensionChatMessage[] {
	// Build a map from current messages first
	const messageMap = new Map<number, ExtensionChatMessage>()
	current.forEach((msg) => messageMap.set(msg.ts, msg))

	// Track duplicate timestamps to detect when extension sends multiple messages with same ts
	const timestampCounts = new Map<number, number>()
	incoming.forEach((msg) => {
		timestampCounts.set(msg.ts, (timestampCounts.get(msg.ts) || 0) + 1)
	})

	// Process incoming messages
	incoming.forEach((incomingMsg, index) => {
		const existingMsg = messageMap.get(incomingMsg.ts)
		const hasDuplicateTimestamp = (timestampCounts.get(incomingMsg.ts) || 0) > 1

		// If there are duplicate timestamps, only keep the LAST occurrence
		// This matches the extension's behavior where later messages override earlier ones
		if (hasDuplicateTimestamp) {
			// Find last index manually (findLastIndex not available in older TS)
			let lastIndexWithSameTs = -1
			for (let i = incoming.length - 1; i >= 0; i--) {
				if (incoming[i]?.ts === incomingMsg.ts) {
					lastIndexWithSameTs = i
					break
				}
			}
			if (index !== lastIndexWithSameTs) {
				logs.debug(
					`[RECONCILE] Skipping duplicate timestamp ts=${incomingMsg.ts} at index ${index} (keeping last at ${lastIndexWithSameTs})`,
					"extension",
				)
				return
			}
		}

		// If we have a streaming message with more content, preserve it
		// This handles race conditions where state updates arrive with older content
		if (existingMsg && streamingSet.has(incomingMsg.ts)) {
			const currentVersion = versionMap.get(incomingMsg.ts) || 0
			const incomingVersion = getMessageContentLength(incomingMsg)

			// Keep the version with more content
			if (currentVersion > incomingVersion) {
				logs.debug(
					`[RECONCILE] Preserving streaming message ts=${incomingMsg.ts} (${currentVersion} > ${incomingVersion})`,
					"extension",
				)
				return
			}
			logs.debug(
				`[RECONCILE] Accepting incoming streaming message ts=${incomingMsg.ts} (${incomingVersion} >= ${currentVersion})`,
				"extension",
			)
		}

		// Accept incoming message
		messageMap.set(incomingMsg.ts, incomingMsg)
	})

	// Return sorted array by timestamp
	return Array.from(messageMap.values()).sort((a, b) => a.ts - b.ts)
}
