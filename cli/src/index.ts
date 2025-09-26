#!/usr/bin/env node

import { Command } from "commander"
import { KiloCodeCLI } from "./cli/KiloCodeCLI.js"
import { logService } from "./services/LogService.js"

// Mock package info for CLI
const Package = {
	name: "kilo-code-cli",
	version: "1.0.0",
}

const program = new Command()

program
	.name("kilocode")
	.description("Kilo Code Terminal User Interface - AI-powered coding assistant")
	.version(Package.version)

program
	.command("chat")
	.description("Start interactive chat session")
	.option("-m, --mode <mode>", "Set initial mode (code, architect, debug, etc.)", "code")
	.option("-w, --workspace <path>", "Set workspace directory", process.cwd())
	.option("--config <path>", "Path to configuration file")
	.action(async (options) => {
		const cli = new KiloCodeCLI(options)
		await cli.startChatSession()
	})

program
	.command("task <message>")
	.description("Execute a single task")
	.option("-m, --mode <mode>", "Set mode for task execution", "code")
	.option("-w, --workspace <path>", "Set workspace directory", process.cwd())
	.option("--auto-approve", "Auto-approve all operations", false)
	.action(async (message, options) => {
		const cli = new KiloCodeCLI(options)
		await cli.executeTask(message)
	})

program
	.command("history")
	.description("View task history")
	.option("-w, --workspace <path>", "Filter by workspace directory")
	.option("--favorites", "Show only favorited tasks", false)
	.action(async (options) => {
		const cli = new KiloCodeCLI(options)
		await cli.showHistory()
	})

program
	.command("settings")
	.description("Configure Kilo Code settings")
	.action(async () => {
		const cli = new KiloCodeCLI({})
		await cli.showSettings()
	})

program
	.command("modes")
	.description("Manage custom modes")
	.action(async () => {
		const cli = new KiloCodeCLI({})
		await cli.showModes()
	})

program
	.command("mcp")
	.description("Manage MCP servers")
	.action(async () => {
		const cli = new KiloCodeCLI({})
		await cli.showMcp()
	})

// Parse command line arguments
program.parse()
