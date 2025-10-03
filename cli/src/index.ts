#!/usr/bin/env node

import { Command } from "commander"
import { existsSync } from "fs"
import { CLI } from "./cli.js"
import { DEFAULT_MODES } from "./constants/modes/defaults.js"

// Mock package info for CLI
const Package = {
	name: "kilo-code-cli",
	version: "1.0.0",
}

const program = new Command()
let cli: CLI | null = null

// Get list of valid mode slugs
const validModes = DEFAULT_MODES.map((mode) => mode.slug)

program
	.name("kilocode")
	.description("Kilo Code Terminal User Interface - AI-powered coding assistant")
	.version(Package.version)
	.option("-m, --mode <mode>", `Set the mode of operation (${validModes.join(", ")})`)
	.option("-w, --workspace <path>", "Path to the workspace directory", process.cwd())
	.option("-ci, --auto", "Run in CI mode (non-interactive)", false)
	.option("-t, --timeout <seconds>", "Timeout in seconds for CI mode (requires --ci)", parseInt)
	.argument("[prompt]", "The prompt or command to execute")
	.action(async (prompt, options) => {
		// Validate mode if provided
		if (options.mode && !validModes.includes(options.mode)) {
			console.error(`Error: Invalid mode "${options.mode}". Valid modes are: ${validModes.join(", ")}`)
			process.exit(1)
		}

		// Validate workspace path exists
		if (!existsSync(options.workspace)) {
			console.error(`Error: Workspace path does not exist: ${options.workspace}`)
			process.exit(1)
		}

		// Read from stdin if no prompt argument is provided and stdin is piped
		let finalPrompt = prompt
		if (!finalPrompt && !process.stdin.isTTY) {
			// Read from stdin
			const chunks: Buffer[] = []
			for await (const chunk of process.stdin) {
				chunks.push(chunk)
			}
			finalPrompt = Buffer.concat(chunks).toString("utf-8").trim()
		}

		// Validate that CI mode requires a prompt
		if (options.ci && !finalPrompt) {
			console.error("Error: CI mode (--ci) requires a prompt argument or piped input")
			process.exit(1)
		}

		// Validate that timeout requires CI mode
		if (options.timeout && !options.ci) {
			console.error("Error: --timeout option requires --ci flag to be enabled")
			process.exit(1)
		}

		// Validate timeout is a positive number
		if (options.timeout && (isNaN(options.timeout) || options.timeout <= 0)) {
			console.error("Error: --timeout must be a positive number")
			process.exit(1)
		}

		cli = new CLI({
			mode: options.mode,
			workspace: options.workspace,
			ci: options.auto,
			prompt: finalPrompt,
			timeout: options.timeout,
		})
		await cli.start()
		await cli.dispose()
	})

// Handle process termination signals
process.on("SIGINT", async () => {
	if (cli) {
		await cli.dispose()
	}
	process.exit(0)
})

process.on("SIGTERM", async () => {
	if (cli) {
		await cli.dispose()
	}
	process.exit(0)
})

// Parse command line arguments
program.parse()
