export interface CliMessage {
	id: string
	type: "user" | "assistant" | "system" | "error"
	content: string
	ts: number
	partial?: boolean | undefined
}
