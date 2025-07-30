import * as vscode from "vscode"

export class GhostCursorAnimation {
	private active = true
	private decoration: vscode.TextEditorDecorationType

	public constructor(context: vscode.ExtensionContext) {
		this.decoration = vscode.window.createTextEditorDecorationType({
			gutterIconPath: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "logo-outline-black.gif"),
			gutterIconSize: "30px",
			isWholeLine: false,
		})
	}

	private getPosition(editor: vscode.TextEditor): vscode.Range {
		const position = editor.selection.active
		const document = editor.document
		const lineEndPosition = new vscode.Position(position.line, document.lineAt(position.line).text.length)
		return new vscode.Range(lineEndPosition, lineEndPosition)
	}

	public update() {
		if (!this.active) {
			return
		}
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}
		const position = this.getPosition(editor)
		editor.setDecorations(this.decoration, [position])
	}
}
