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
 */
export const updateExtensionStateAtom = atom(null, (get, set, state: ExtensionState | null) => {
	const currentRouterModels = get(routerModelsAtom)

	set(extensionStateAtom, state)

	if (state) {
		// Sync all derived atoms
		const messages = state.clineMessages || state.chatMessages || []
		set(chatMessagesAtom, [...messages])
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
 */
export const updateChatMessageByTsAtom = atom(null, (get, set, updatedMessage: ExtensionChatMessage) => {
	const messages = get(chatMessagesAtom)
	const messageIndex = messages.findIndex((msg) => msg.ts === updatedMessage.ts)

	if (messageIndex >= 0) {
		// Update existing message
		const newMessages = [...messages]
		newMessages[messageIndex] = updatedMessage
		set(updateChatMessagesAtom, newMessages)
	} else {
		set(addChatMessageAtom, updatedMessage)
	}
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
})
