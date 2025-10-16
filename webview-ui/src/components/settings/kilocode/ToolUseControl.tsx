import React, { useCallback } from "react"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { ToolUseStyle } from "@roo-code/types"

interface ToolUseControlProps {
	toolStyle?: ToolUseStyle
	onChange: (field: "toolStyle", value: ToolUseStyle) => void
}

export const ToolUseControl: React.FC<ToolUseControlProps> = ({ toolStyle = "xml", onChange }) => {
	const handleToolStyleChange = useCallback(
		(e: any) => {
			const value = e.target.value as ToolUseStyle
			onChange("toolStyle", value)
		},
		[onChange],
	)

	return (
		<div className="flex flex-col gap-1">
			<div>
				<label className="block font-medium mb-1">Tool Call Style</label>
				<VSCodeDropdown value={toolStyle} onChange={handleToolStyleChange}>
					<VSCodeOption value="xml">XML</VSCodeOption>
					<VSCodeOption value="json">JSON</VSCodeOption>
				</VSCodeDropdown>
				<div className="text-vscode-descriptionForeground text-sm mt-1">
					Choose how tool calls are formatted in the system prompt
				</div>
			</div>
		</div>
	)
}
