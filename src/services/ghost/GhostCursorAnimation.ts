import * as vscode from "vscode"

export class GhostCursorAnimation {
	private active = false
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
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}
		if (!this.active) {
			editor.setDecorations(this.decoration, [])
			return
		}
		const position = this.getPosition(editor)
		editor.setDecorations(this.decoration, [position])
	}

	public show() {
		this.active = true
		this.update()
	}

	public hide() {
		this.active = false
		this.update()
	}
}
