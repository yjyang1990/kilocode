import React, { useCallback } from "react"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { ToolUseStyle, toolUseStylesSchema } from "@roo-code/types"

interface ToolUseControlProps {
	toolStyle?: ToolUseStyle
	onChange: (field: "toolStyle", value?: ToolUseStyle) => void
}

export const ToolUseControl: React.FC<ToolUseControlProps> = ({ toolStyle, onChange }) => {
	const handleToolStyleChange = useCallback(
		(e: any) => {
			const value = toolUseStylesSchema.safeParse(e.target.value).data
			onChange("toolStyle", value)
		},
		[onChange],
	)

	return (
		<div className="flex flex-col gap-1">
			<div>
				<label className="block font-medium mb-1">Tool Call Style</label>
				<VSCodeDropdown value={toolStyle} onChange={handleToolStyleChange}>
					<VSCodeOption value="">(default)</VSCodeOption>
					<VSCodeOption value="xml">XML</VSCodeOption>
					<VSCodeOption value="json">JSON (experimental)</VSCodeOption>
				</VSCodeDropdown>
				<div className="text-vscode-descriptionForeground text-sm mt-1">
					Choose how tool calls are formatted in the system prompt. JSON is currently experimental and mostly
					intended for users interested in contributing to its development.
				</div>
			</div>
		</div>
	)
}
