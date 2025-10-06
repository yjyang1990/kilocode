/**
 * /new command - Start a new task with a clean slate
 */

import type { Command } from "./core/types.js"

export const newCommand: Command = {
	name: "new",
	aliases: ["n", "start"],
	description: "Start a new task with a clean slate",
	usage: "/new",
	examples: ["/new", "/n", "/start"],
	category: "system",
	priority: 9,
	handler: async (context) => {
		const { clearTask, clearMessages, addMessage } = context

		// Clear the extension task state
		await clearTask()

		// Clear the CLI message history
		clearMessages()

		// Add a system message confirming the new task start
		addMessage({
			id: Date.now().toString(),
			type: "system",
			content: "Ready for a new task. Message history and task state cleared.",
			ts: Date.now(),
		})
	},
}
