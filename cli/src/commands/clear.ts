/**
 * /clear command - Clear the message history
 */

import type { Command } from "./core/types.js"

export const clearCommand: Command = {
	name: "clear",
	aliases: ["cls", "c"],
	description: "Clear the message history",
	usage: "/clear",
	examples: ["/clear"],
	category: "system",
	priority: 8,
	handler: async (context) => {
		const { clearMessages, addMessage } = context

		clearMessages()

		addMessage({
			id: Date.now().toString(),
			type: "system",
			content: "Message history cleared.",
			ts: Date.now(),
		})
	},
}
