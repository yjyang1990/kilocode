// Local type definitions for CLI application
// These mirror the types from the main extension but are defined locally to avoid import issues

export interface ExtensionMessage {
	type: string
	action?: string
	text?: string
	state?: any
	images?: string[]
	clineMessage?: any
	values?: Record<string, any>
	[key: string]: any
}

export interface WebviewMessage {
	type: string
	text?: string
	images?: string[]
	bool?: boolean
	value?: number
	commands?: string[]
	apiConfiguration?: any
	mode?: string
	values?: Record<string, any>
	askResponse?: string
	terminalOperation?: string
	context?: string
	invoke?: string
	action?: string
	[key: string]: any
}

export interface ClineMessage {
	ts: number
	type: "ask" | "say"
	ask?: string
	say?: string
	text?: string
	images?: string[]
	partial?: boolean
	isProtected?: boolean
	isAnswered?: boolean
	checkpoint?: any
	metadata?: any
}

export interface HistoryItem {
	id: string
	ts: number
	task: string
	workspace: string
	mode?: string
	isFavorited?: boolean
	fileNotfound?: boolean
	rootTaskId?: string
	parentTaskId?: string
	number?: number
}

export interface ProviderSettings {
	apiProvider?: string
	kilocodeToken?: string
	kilocodeModel?: string
	kilocodeOrganizationId?: string
	[key: string]: any
}

export interface TodoItem {
	id: string
	text: string
	status: "pending" | "in_progress" | "completed"
	createdAt: number
	updatedAt: number
}

export interface McpServer {
	name: string
	command: string
	args?: string[]
	env?: Record<string, string>
	disabled?: boolean
	alwaysAllow?: boolean
	tools?: McpTool[]
	resources?: McpResource[]
}

export interface McpTool {
	name: string
	description?: string
	alwaysAllow?: boolean
	enabledForPrompt?: boolean
}

export interface McpResource {
	uri: string
	name?: string
	description?: string
}

export interface ExtensionState {
	version: string
	apiConfiguration: ProviderSettings
	clineMessages: ClineMessage[]
	currentTaskItem?: HistoryItem
	currentTaskTodos?: TodoItem[]
	mode: string
	customModes: any[]
	taskHistoryFullLength: number
	taskHistoryVersion: number
	mcpServers?: McpServer[]
	telemetrySetting: string
	renderContext: "sidebar" | "editor" | "cli"
	cwd?: string
	[key: string]: any
}

export type Mode = string

export interface ModeConfig {
	slug: string
	name: string
	description?: string
	systemPrompt?: string
	rules?: string[]
	source?: "global" | "project"
}
