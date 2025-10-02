/**
 * Custom React hooks for service integration
 *
 * This module exports all custom hooks for accessing and managing
 * the ExtensionService, messages, tasks, models, and command input.
 */

// Service hooks
export { useExtensionService } from "./useExtensionService.js"
export type { UseExtensionServiceReturn } from "./useExtensionService.js"

// Message hooks
export { useWebviewMessage } from "./useWebviewMessage.js"
export type {
	UseWebviewMessageReturn,
	SendTaskParams,
	SendAskResponseParams,
	RespondToToolParams,
} from "./useWebviewMessage.js"

export { useExtensionMessage } from "./useExtensionMessage.js"
export type { UseExtensionMessageReturn, MessageFilter } from "./useExtensionMessage.js"

// Task management hooks
export { useTaskManagement } from "./useTaskManagement.js"
export type { UseTaskManagementReturn, TodoFilter } from "./useTaskManagement.js"

// Model selection hooks
export { useModelSelection } from "./useModelSelection.js"
export type { UseModelSelectionReturn } from "./useModelSelection.js"

// Command input hooks
export { useCommandInput } from "./useCommandInput.js"
export type { UseCommandInputReturn } from "./useCommandInput.js"
