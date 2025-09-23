import React, { useState, useEffect, useRef } from "react"
import { Box, Text, useInput } from "ink"
import SelectInput from "ink-select-input"
import TextInput from "ink-text-input"
import type { ExtensionState, WebviewMessage, ProviderSettings } from "../../types/messages.js"

interface SettingsViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
	sidebarVisible?: boolean
}

type SettingCategory = "api" | "behavior" | "terminal" | "advanced"

interface SettingsState {
	currentCategory: SettingCategory
	editingField: string | null
	editingValue: string
	focusMode: "sidebar" | "content"
	selectedSettingIndex: number
}

const categories: { value: SettingCategory; label: string }[] = [
	{ value: "api", label: "🤖 API Configuration" },
	{ value: "behavior", label: "⚙️  Behavior Settings" },
	{ value: "terminal", label: "💻 Terminal Settings" },
	{ value: "advanced", label: "🔧 Advanced Settings" },
]

export const SettingsView: React.FC<SettingsViewProps> = ({
	extensionState,
	sendMessage,
	onBack,
	sidebarVisible = false,
}) => {
	const [settingsState, setSettingsState] = useState<SettingsState>({
		currentCategory: "api",
		editingField: null,
		editingValue: "",
		focusMode: "content", // Start with content focused so users can edit settings immediately
		selectedSettingIndex: 0, // Start with first setting selected
	})

	const apiConfig = extensionState?.apiConfiguration || {}
	const currentApiConfigName = extensionState?.currentApiConfigName || "default"

	// Track the previous API config name to detect when it changes (indicating a successful save)
	const prevApiConfigName = useRef(currentApiConfigName)

	// Update the editing state when the API configuration changes (after successful save)
	useEffect(() => {
		// If we were editing a field and the API config name changed, it means the save was successful
		if (settingsState.editingField && prevApiConfigName.current !== currentApiConfigName) {
			setSettingsState((prev) => ({
				...prev,
				editingField: null,
				editingValue: "",
			}))
		}
		prevApiConfigName.current = currentApiConfigName
	}, [currentApiConfigName, settingsState.editingField])

	const handleCategorySelect = (item: any) => {
		setSettingsState((prev) => ({ ...prev, currentCategory: item.value }))
	}

	const handleFieldEdit = (field: string, currentValue: string) => {
		setSettingsState((prev) => ({
			...prev,
			editingField: field,
			editingValue: currentValue || "",
		}))
	}

	const handleSaveField = async () => {
		if (!settingsState.editingField) return

		try {
			const updatedConfig = {
				...apiConfig,
				[settingsState.editingField]: settingsState.editingValue,
			}

			await sendMessage({
				type: "upsertApiConfiguration",
				text: extensionState?.currentApiConfigName || "default",
				apiConfiguration: updatedConfig,
			})

			setSettingsState((prev) => ({
				...prev,
				editingField: null,
				editingValue: "",
			}))
		} catch (error) {
			console.error("Failed to save setting:", error)
		}
	}

	const handleCancelEdit = () => {
		setSettingsState((prev) => ({
			...prev,
			editingField: null,
			editingValue: "",
		}))
	}

	useInput((input, key) => {
		// Don't handle input when sidebar is visible
		if (sidebarVisible) return

		// Handle editing mode first
		if (settingsState.editingField) {
			if (key.return) {
				handleSaveField()
				return // Consume the input
			}
			// Let other keys pass through to TextInput when editing
			return
		}

		// Handle focus switching with Tab
		if (key.tab) {
			setSettingsState((prev) => ({
				...prev,
				focusMode: prev.focusMode === "sidebar" ? "content" : "sidebar",
				selectedSettingIndex: 0, // Reset selection when switching focus
			}))
			return // Consume the input
		}

		// Handle navigation within content when in content focus mode
		if (settingsState.focusMode === "content") {
			const currentSettings = getCurrentSettings()

			if (key.upArrow) {
				setSettingsState((prev) => ({
					...prev,
					selectedSettingIndex: Math.max(0, prev.selectedSettingIndex - 1),
				}))
				return // Consume the input
			} else if (key.downArrow) {
				setSettingsState((prev) => ({
					...prev,
					selectedSettingIndex: Math.min(currentSettings.length - 1, prev.selectedSettingIndex + 1),
				}))
				return // Consume the input
			} else if (key.return) {
				// Edit the currently selected setting
				const selectedSetting = currentSettings[settingsState.selectedSettingIndex]
				if (selectedSetting) {
					selectedSetting.onEdit()
				}
				return // Consume the input
			}
		}

		// When in sidebar focus mode, don't let input pass through to SettingRow
	})

	// Get current settings based on category
	const getCurrentSettings = () => {
		switch (settingsState.currentCategory) {
			case "api":
				return [
					{
						field: "apiProvider",
						label: "API Provider",
						value: apiConfig.apiProvider || "kilocode",
						onEdit: () => handleFieldEdit("apiProvider", apiConfig.apiProvider || ""),
					},
					{
						field: "kilocodeToken",
						label: "Kilo Code Token",
						value: apiConfig.kilocodeToken ? "••••••••" : "Not set",
						onEdit: () => handleFieldEdit("kilocodeToken", apiConfig.kilocodeToken || ""),
					},
					{
						field: "kilocodeModel",
						label: "Model",
						value: apiConfig.kilocodeModel || "anthropic/claude-sonnet-4",
						onEdit: () => handleFieldEdit("kilocodeModel", apiConfig.kilocodeModel || ""),
					},
				]
			default:
				return []
		}
	}

	const renderApiSettings = () => {
		const settings = getCurrentSettings()
		return (
			<Box flexDirection="column" gap={1}>
				{settings.map((setting, index) => (
					<SettingRow
						key={setting.field}
						label={setting.label}
						value={setting.value}
						onEdit={setting.onEdit}
						isEditing={settingsState.editingField === setting.field}
						isSelected={
							settingsState.focusMode === "content" && settingsState.selectedSettingIndex === index
						}
					/>
				))}
			</Box>
		)
	}

	const renderBehaviorSettings = () => (
		<Box flexDirection="column" gap={1}>
			<Text color="gray">Auto-approval settings, permissions, etc.</Text>
			<Text color="yellow">Coming soon...</Text>
		</Box>
	)

	const renderTerminalSettings = () => (
		<Box flexDirection="column" gap={1}>
			<Text color="gray">Terminal integration settings</Text>
			<Text color="yellow">Coming soon...</Text>
		</Box>
	)

	const renderAdvancedSettings = () => (
		<Box flexDirection="column" gap={1}>
			<Text color="gray">Advanced configuration options</Text>
			<Text color="yellow">Coming soon...</Text>
		</Box>
	)

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					⚙️ Settings
				</Text>
			</Box>

			<Box flexDirection="row" flexGrow={1}>
				{/* Category sidebar */}
				<Box
					borderStyle="single"
					borderColor={settingsState.focusMode === "sidebar" ? "blue" : "gray"}
					width={25}
					paddingX={1}
					paddingY={1}>
					{settingsState.focusMode === "sidebar" && !sidebarVisible ? (
						<SelectInput items={categories} onSelect={handleCategorySelect} />
					) : (
						<Box flexDirection="column">
							{categories.map((category) => (
								<Text
									key={category.value}
									color={category.value === settingsState.currentCategory ? "blue" : "gray"}>
									{category.value === settingsState.currentCategory ? "❯" : " "}
									{category.label}
								</Text>
							))}
						</Box>
					)}
				</Box>

				{/* Settings content */}
				{settingsState.focusMode === "content" ? (
					<Box
						flexDirection="column"
						flexGrow={1}
						paddingX={2}
						paddingY={1}
						borderStyle="single"
						borderColor="blue">
						{settingsState.editingField ? (
							<Box flexDirection="column" gap={1}>
								<Text color="blue">Editing: {settingsState.editingField}</Text>
								<Box>
									<Text>Value: </Text>
									<TextInput
										value={settingsState.editingValue}
										onChange={(value) =>
											setSettingsState((prev) => ({ ...prev, editingValue: value }))
										}
										onSubmit={handleSaveField}
									/>
								</Box>
								<Text color="gray" dimColor>
									Press Enter to save
								</Text>
							</Box>
						) : (
							<>
								{settingsState.currentCategory === "api" && renderApiSettings()}
								{settingsState.currentCategory === "behavior" && renderBehaviorSettings()}
								{settingsState.currentCategory === "terminal" && renderTerminalSettings()}
								{settingsState.currentCategory === "advanced" && renderAdvancedSettings()}
							</>
						)}
					</Box>
				) : (
					<Box flexDirection="column" flexGrow={1} paddingX={2} paddingY={1}>
						{settingsState.editingField ? (
							<Box flexDirection="column" gap={1}>
								<Text color="blue">Editing: {settingsState.editingField}</Text>
								<Box>
									<Text>Value: </Text>
									<TextInput
										value={settingsState.editingValue}
										onChange={(value) =>
											setSettingsState((prev) => ({ ...prev, editingValue: value }))
										}
										onSubmit={handleSaveField}
									/>
								</Box>
								<Text color="gray" dimColor>
									Press Enter to save
								</Text>
							</Box>
						) : (
							<>
								{settingsState.currentCategory === "api" && renderApiSettings()}
								{settingsState.currentCategory === "behavior" && renderBehaviorSettings()}
								{settingsState.currentCategory === "terminal" && renderTerminalSettings()}
								{settingsState.currentCategory === "advanced" && renderAdvancedSettings()}
							</>
						)}
					</Box>
				)}
			</Box>

			{/* Footer */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">Tab</Text> to switch focus, <Text color="blue">↑↓</Text> to navigate,{" "}
					<Text color="blue">Enter</Text> to edit
				</Text>
			</Box>
		</Box>
	)
}

// Helper component for individual setting rows
const SettingRow: React.FC<{
	label: string
	value: string
	onEdit: () => void
	isEditing: boolean
	isSelected: boolean
}> = ({ label, value, onEdit, isEditing, isSelected }) => {
	// Remove the useInput hook from individual rows since we handle navigation centrally

	return (
		<Box justifyContent="space-between" paddingX={isSelected ? 1 : 0}>
			<Text color={isEditing ? "blue" : isSelected ? "cyan" : "white"}>
				{isSelected ? "❯ " : "  "}
				{label}:
			</Text>
			<Text color={isEditing ? "blue" : isSelected ? "cyan" : "gray"}>{value}</Text>
		</Box>
	)
}
