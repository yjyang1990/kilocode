import React from "react"
import { Box } from "ink"
import { Text } from "../common/Text.js"
import { useExtensionState, useCliState } from "../../context/index.js"
import { getSelectedModelId } from "../../../utils/providers.js"

export const StatusBar: React.FC = () => {
	const extensionState = useExtensionState()
	const { workspace } = useCliState()
	const currentMode = extensionState?.mode || "unknown"
	const apiProvider = extensionState?.apiConfiguration?.apiProvider || "unknown"
	const model = getSelectedModelId(apiProvider, extensionState?.apiConfiguration)
	const projectName = workspace.split("/").pop() || "unknown"

	// Get current time in user's timezone
	const currentTime = new Date().toLocaleTimeString("en-US", {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	})

	// Format model name for display (remove provider prefix if present)
	const displayModel = model.includes("/") ? model.split("/").pop() : model

	return (
		<Box borderStyle="single" borderColor="blue" paddingX={1} justifyContent="space-between">
			{/* Left side: Kilo Code > Provider > Model > Mode */}
			<Box>
				<Text color="blue" bold>
					Kilo Code
				</Text>
				<Text color="gray"> › </Text>
				<Text color="yellow">{apiProvider}</Text>
				<Text color="gray"> › </Text>
				<Text color="cyan">{displayModel}</Text>
				<Text color="gray"> › </Text>
				<Text color="green">{currentMode}</Text>
			</Box>

			{/* Right side: Project | Time */}
			<Box>
				<Text color="magenta">{projectName}</Text>
				<Text color="gray"> | </Text>
				<Text color="white">{currentTime}</Text>
			</Box>
		</Box>
	)
}
