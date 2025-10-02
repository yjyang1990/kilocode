#!/usr/bin/env node

import { Command } from "commander"
import { CLI } from "./cli.js"

// Mock package info for CLI
const Package = {
	name: "kilo-code-cli",
	version: "1.0.0",
}

const program = new Command()
let cli: CLI | null = null

program
	.name("kilocode")
	.description("Kilo Code Terminal User Interface - AI-powered coding assistant")
	.version(Package.version)
	.action(async (options) => {
		cli = new CLI({})
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
