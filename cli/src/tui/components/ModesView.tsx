import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"
import SelectInput from "ink-select-input"
import type { ExtensionState, WebviewMessage, ModeConfig } from "../../types/messages.js"

interface ModesViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
}

interface ModesState {
	modes: ModeConfig[]
	currentMode: string
	selectedIndex: number
}

const defaultModes = [
	{ slug: "code", name: "Code", description: "Write, modify, and refactor code" },
	{ slug: "architect", name: "Architect", description: "Plan and design system architecture" },
	{ slug: "debug", name: "Debug", description: "Troubleshoot and fix issues" },
	{ slug: "ask", name: "Ask", description: "Get explanations and answers" },
	{ slug: "test", name: "Test", description: "Write and maintain tests" },
]

export const ModesView: React.FC<ModesViewProps> = ({ extensionState, sendMessage, onBack }) => {
	const [modesState, setModesState] = useState<ModesState>({
		modes: defaultModes,
		currentMode: extensionState?.mode || "code",
		selectedIndex: 0,
	})

	useEffect(() => {
		// Combine default modes with custom modes
		const customModes = extensionState?.customModes || []
		const allModes = [...defaultModes, ...customModes]

		setModesState((prev) => ({
			...prev,
			modes: allModes,
			currentMode: extensionState?.mode || "code",
		}))
	}, [extensionState?.customModes, extensionState?.mode])

	const handleModeSelect = async (item: any) => {
		try {
			await sendMessage({
				type: "mode",
				text: item.value,
			})

			setModesState((prev) => ({ ...prev, currentMode: item.value }))
		} catch (error) {
			console.error("Failed to switch mode:", error)
		}
	}

	useInput((input, key) => {
		if (key.escape) {
			onBack()
		}
	})

	const modeItems = modesState.modes.map((mode) => ({
		label: `${mode.name} - ${mode.description || "No description"}`,
		value: mode.slug,
	}))

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					🎭 Modes - Current: {modesState.currentMode}
				</Text>
			</Box>

			{/* Mode list */}
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
				<Box marginBottom={1}>
					<Text color="gray">Select a mode to switch to:</Text>
				</Box>
				<SelectInput items={modeItems} onSelect={handleModeSelect} />
			</Box>

			{/* Footer */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">Enter</Text> to switch mode, <Text color="gray">Esc</Text> to go back
				</Text>
			</Box>
		</Box>
	)
}
