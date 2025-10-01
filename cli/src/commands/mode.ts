/**
 * /mode command - Switch between different modes
 */

import type { Command } from "./core/types.js"

const AVAILABLE_MODES = ["code", "architect", "ask", "debug", "orchestrator", "translate", "test"]

export const modeCommand: Command = {
	name: "mode",
	aliases: ["m"],
	description: "Switch to a different mode",
	usage: "/mode <mode-name>",
	examples: ["/mode code", "/mode architect", "/mode debug"],
	category: "settings",
	priority: 9,
	arguments: [
		{
			name: "mode-name",
			description: "The mode to switch to",
			required: true,
			values: AVAILABLE_MODES,
			placeholder: "Select a mode",
			validate: (value) => {
				const isValid = AVAILABLE_MODES.includes(value.toLowerCase())
				return {
					valid: isValid,
					...(isValid ? {} : { error: `Invalid mode. Available: ${AVAILABLE_MODES.join(", ")}` }),
				}
			},
		},
	],
	handler: async (context) => {
		const { args, addMessage, setMode } = context

		if (args.length === 0 || !args[0]) {
			// Show current mode and available modes
			addMessage({
				id: Date.now().toString(),
				type: "system",
				content: [
					"**Available Modes:**",
					"",
					...AVAILABLE_MODES.map((mode) => `  - ${mode}`),
					"",
					"Usage: /mode <mode-name>",
				].join("\n"),
				timestamp: Date.now(),
			})
			return
		}

		const requestedMode = args[0].toLowerCase()

		if (!AVAILABLE_MODES.includes(requestedMode)) {
			addMessage({
				id: Date.now().toString(),
				type: "error",
				content: `Invalid mode "${requestedMode}". Available modes: ${AVAILABLE_MODES.join(", ")}`,
				timestamp: Date.now(),
			})
			return
		}

		setMode(requestedMode)

		addMessage({
			id: Date.now().toString(),
			type: "system",
			content: `Switched to **${requestedMode}** mode.`,
			timestamp: Date.now(),
		})
	},
}
