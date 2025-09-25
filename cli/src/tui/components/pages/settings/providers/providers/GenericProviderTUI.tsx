import React from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { ProviderSettings, ProviderName } from "../../../../../../types/messages.js"
import {
	getProviderSettings,
	providerSupportsModelList,
	getModelFieldForProvider,
	isModelField,
} from "../../../../../../constants/index.js"
import { useRouter } from "../../../../../router/index.js"

interface GenericProviderTUIProps {
	provider: ProviderName
	apiConfiguration: ProviderSettings
	editingField: string | null
	editingValue: string
	selectedSettingIndex: number
	onFieldEdit: (field: string, currentValue: string) => void
	onEditingValueChange: (value: string) => void
}

export const GenericProviderTUI: React.FC<GenericProviderTUIProps> = ({
	provider,
	apiConfiguration,
	editingField,
	editingValue,
	selectedSettingIndex,
	onFieldEdit,
	onEditingValueChange,
}) => {
	const router = useRouter()

	// Use the unified provider settings system
	const settings = getProviderSettings(provider, apiConfiguration)
	const supportsModelList = providerSupportsModelList(provider)
	const modelField = getModelFieldForProvider(provider)

	// Handle field selection - redirect to model selector for model fields
	const handleFieldSelect = (field: string, currentValue: string) => {
		if (supportsModelList && field === modelField) {
			router.navigate(`/settings/providers/choose-model?provider=${provider}&field=${field}`)
		} else {
			onFieldEdit(field, currentValue)
		}
	}

	if (editingField) {
		const editingSetting = settings.find((s) => s.field === editingField)
		return (
			<Box flexDirection="column" gap={1}>
				<Text color="blue">Editing: {editingSetting?.label}</Text>
				<Box>
					<Text>Value: </Text>
					{editingSetting?.type === "password" ? (
						<TextInput value={editingValue} onChange={onEditingValueChange} mask="*" />
					) : editingSetting?.type === "boolean" ? (
						<TextInput value={editingValue} onChange={onEditingValueChange} placeholder="true/false" />
					) : (
						<TextInput value={editingValue} onChange={onEditingValueChange} />
					)}
				</Box>
				<Text color="gray" dimColor>
					Press Enter to save, Escape to cancel
				</Text>
			</Box>
		)
	}

	// Get provider display name
	const providerDisplayName = provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, " ")

	// Check if provider needs API key and show warning
	const needsApiKey = settings.some(
		(s) => s.field.toLowerCase().includes("apikey") || s.field.toLowerCase().includes("token"),
	)
	const hasApiKey = settings.some(
		(s) => (s.field.toLowerCase().includes("apikey") || s.field.toLowerCase().includes("token")) && s.actualValue,
	)

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>{providerDisplayName} Settings</Text>

			{needsApiKey && !hasApiKey && (
				<Box flexDirection="column" gap={1} marginBottom={1}>
					<Text color="yellow">⚠ No API key configured</Text>
					<Text color="gray" dimColor>
						Configure your API key to use this provider
					</Text>
				</Box>
			)}

			{settings.map((setting, index) => (
				<Box
					key={setting.field}
					justifyContent="space-between"
					paddingX={selectedSettingIndex === index ? 1 : 0}>
					<Text color={selectedSettingIndex === index ? "cyan" : "white"}>
						{selectedSettingIndex === index ? "❯ " : "  "}
						{setting.label}:
					</Text>
					<Text color={selectedSettingIndex === index ? "cyan" : "gray"}>
						{setting.value}
						{supportsModelList && setting.field === modelField ? " 📋" : ""}
					</Text>
				</Box>
			))}

			{supportsModelList && (
				<Box marginTop={1}>
					<Text color="gray" dimColor>
						📋 = Model selector available (dynamic model list)
					</Text>
				</Box>
			)}
		</Box>
	)
}
