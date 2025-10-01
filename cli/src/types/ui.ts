/**
 * Type definitions for the command-based UI
 */

export interface Message {
	id: string
	type: "user" | "assistant" | "system" | "error"
	content: string
	timestamp: number
	partial?: boolean | undefined
}

export interface UIOptions {
	messageBridge: any
	initialMode?: string
	workspace?: string
	autoApprove?: boolean
}
