// kilocode_change - new file
import { TerminalWelcomeService } from "./TerminalWelcomeService"
import type * as vscode from "vscode"

export function registerWelcomeService(context: vscode.ExtensionContext): void {
	TerminalWelcomeService.register(context)
}
