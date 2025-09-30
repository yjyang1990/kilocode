import React, { useState, useEffect } from "react"
import { Box } from "ink"
import { Text } from "../common/Text.js"
import SelectInput from "ink-select-input"
import type { ModeConfig } from "../../../types/messages.js"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../context/index.js"
import { useRouter } from "../../router/index.js"
import { DEFAULT_MODES, DEFAULT_MODE_SLUG, createModeItems } from "../../../constants/index.js"

interface ModesState {
	modes: ModeConfig[]
	currentMode: string
	selectedIndex: number
}

export const ModesView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const { goBack } = useRouter()
	const [modesState, setModesState] = useState<ModesState>({
		modes: DEFAULT_MODES,
		currentMode: extensionState?.mode || DEFAULT_MODE_SLUG,
		selectedIndex: 0,
	})

	useEffect(() => {
		// Combine default modes with custom modes
		const customModes = extensionState?.customModes || []
		const allModes = [...DEFAULT_MODES, ...customModes]

		setModesState((prev) => ({
			...prev,
			modes: allModes,
			currentMode: extensionState?.mode || DEFAULT_MODE_SLUG,
		}))
	}, [extensionState?.customModes, extensionState?.mode])

	const handleModeSelect = async (item: any) => {
		try {
			await sendMessage({
				type: "mode",
				text: item.value,
			})

			setModesState((prev) => ({ ...prev, currentMode: item.value }))

			// Navigate back to chat after switching mode
			goBack()
		} catch (error) {
			console.error("Failed to switch mode:", error)
		}
	}

	// Use the new keyboard navigation hook
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			// No special keyboard shortcuts needed for this view
		},
	})

	const modeItems = createModeItems(modesState.modes)

	// Create header
	const header = <PageHeader title="Modes" subtitle={`Current: ${modesState.currentMode}`} />

	// Create footer with action hints
	const footer = <PageFooter actions={[{ key: "Enter", label: "to switch mode" }]} />

	// Create main content
	const content = (
		<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
			<Box marginBottom={1}>
				<Text color="gray">Select a mode to switch to:</Text>
			</Box>
			{sidebarVisible ? (
				<Box flexDirection="column">
					{modeItems.map((item, index) => (
						<Text key={item.value} color={item.value === modesState.currentMode ? "cyan" : "white"}>
							{item.value === modesState.currentMode ? "❯ " : "  "}
							{item.label}
						</Text>
					))}
				</Box>
			) : (
				<SelectInput items={modeItems} onSelect={handleModeSelect} />
			)}
		</Box>
	)

	return (
		<PageLayout header={header} footer={footer}>
			{content}
		</PageLayout>
	)
}
