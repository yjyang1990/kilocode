import * as vscode from "vscode"

export async function migrateBigModelProvider(
	context: vscode.ExtensionContext,
	outputChannel: vscode.OutputChannel,
): Promise<void> {
	const state = context.globalState
	if (state.get("apiProvider") === "bigmodel") {
		outputChannel.appendLine("Migrating removed Big Model API provider to Z.AI API provider.")
		await state.update("apiProvider", "zai")

		const bigModelApiKey = state.get("bigModelApiKey")
		if (bigModelApiKey && !state.get("zaiApiKey")) {
			outputChannel.appendLine("Migrating Big Model API key to Z.AI China key.")
			await state.update("zaiApiLine", "china")
			await state.update("zaiApiKey", bigModelApiKey)
			await state.update("bigModelApiKey", undefined)
		}
		outputChannel.appendLine("Big Model migration done.")
	}
}
