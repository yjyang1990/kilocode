import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"
import SelectInput from "ink-select-input"
import TextInput from "ink-text-input"
import type { ExtensionState, WebviewMessage, ProviderSettings } from "../../types/messages.js"

interface SettingsViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
}

type SettingCategory = "api" | "behavior" | "terminal" | "advanced"

interface SettingsState {
	currentCategory: SettingCategory
	editingField: string | null
	editingValue: string
}

const categories: { value: SettingCategory; label: string }[] = [
	{ value: "api", label: "🤖 API Configuration" },
	{ value: "behavior", label: "⚙️  Behavior Settings" },
	{ value: "terminal", label: "💻 Terminal Settings" },
	{ value: "advanced", label: "🔧 Advanced Settings" },
]

export const SettingsView: React.FC<SettingsViewProps> = ({ extensionState, sendMessage, onBack }) => {
	const [settingsState, setSettingsState] = useState<SettingsState>({
		currentCategory: "api",
		editingField: null,
		editingValue: "",
	})

	const apiConfig = extensionState?.apiConfiguration || {}

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
		if (settingsState.editingField) {
			if (key.escape) {
				handleCancelEdit()
			} else if (key.return) {
				handleSaveField()
			}
			return
		}

		if (key.escape) {
			onBack()
		}
	})

	const renderApiSettings = () => (
		<Box flexDirection="column" gap={1}>
			<SettingRow
				label="API Provider"
				value={apiConfig.apiProvider || "kilocode"}
				onEdit={() => handleFieldEdit("apiProvider", apiConfig.apiProvider || "")}
				isEditing={settingsState.editingField === "apiProvider"}
			/>
			<SettingRow
				label="Kilo Code Token"
				value={apiConfig.kilocodeToken ? "••••••••" : "Not set"}
				onEdit={() => handleFieldEdit("kilocodeToken", apiConfig.kilocodeToken || "")}
				isEditing={settingsState.editingField === "kilocodeToken"}
			/>
			<SettingRow
				label="Model"
				value={apiConfig.kilocodeModel || "claude-3-5-sonnet-20241022"}
				onEdit={() => handleFieldEdit("kilocodeModel", apiConfig.kilocodeModel || "")}
				isEditing={settingsState.editingField === "kilocodeModel"}
			/>
		</Box>
	)

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
				<Box borderStyle="single" borderColor="gray" width={25} paddingX={1} paddingY={1}>
					<SelectInput items={categories} onSelect={handleCategorySelect} />
				</Box>

				{/* Settings content */}
				<Box flexDirection="column" flexGrow={1} paddingX={2} paddingY={1}>
					{settingsState.editingField ? (
						<Box flexDirection="column" gap={1}>
							<Text color="blue">Editing: {settingsState.editingField}</Text>
							<Box>
								<Text>Value: </Text>
								<TextInput
									value={settingsState.editingValue}
									onChange={(value) => setSettingsState((prev) => ({ ...prev, editingValue: value }))}
									onSubmit={handleSaveField}
								/>
							</Box>
							<Text color="gray" dimColor>
								Press Enter to save, Esc to cancel
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
			</Box>

			{/* Footer */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">Enter</Text> to edit, <Text color="gray">Esc</Text> to go back
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
}> = ({ label, value, onEdit, isEditing }) => {
	useInput((input, key) => {
		if (!isEditing && key.return) {
			onEdit()
		}
	})

	return (
		<Box justifyContent="space-between">
			<Text color={isEditing ? "blue" : "white"}>{label}:</Text>
			<Text color={isEditing ? "blue" : "gray"}>{value}</Text>
		</Box>
	)
}
