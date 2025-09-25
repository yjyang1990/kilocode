import React from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { ProviderSettings } from "../../../../../../types/messages.js"

interface AnthropicTUIProps {
	apiConfiguration: ProviderSettings
	editingField: string | null
	editingValue: string
	selectedSettingIndex: number
	onFieldEdit: (field: string, currentValue: string) => void
	onEditingValueChange: (value: string) => void
}

export const AnthropicTUI: React.FC<AnthropicTUIProps> = ({
	apiConfiguration,
	editingField,
	editingValue,
	selectedSettingIndex,
	onFieldEdit,
	onEditingValueChange,
}) => {
	const settings = [
		{
			field: "apiKey",
			label: "API Key",
			value: apiConfiguration.apiKey ? "••••••••" : "Not set",
			actualValue: apiConfiguration.apiKey || "",
			type: "password" as const,
		},
		{
			field: "apiModelId",
			label: "Model",
			value: apiConfiguration.apiModelId || "claude-3-5-sonnet-20241022",
			actualValue: apiConfiguration.apiModelId || "",
			type: "text" as const,
		},
		{
			field: "anthropicBaseUrl",
			label: "Base URL",
			value: apiConfiguration.anthropicBaseUrl || "Default",
			actualValue: apiConfiguration.anthropicBaseUrl || "",
			type: "text" as const,
		},
		{
			field: "anthropicUseAuthToken",
			label: "Use Auth Token",
			value: apiConfiguration.anthropicUseAuthToken ? "Yes" : "No",
			actualValue: apiConfiguration.anthropicUseAuthToken ? "true" : "false",
			type: "boolean" as const,
		},
		{
			field: "anthropicBeta1MContext",
			label: "1M Context Beta",
			value: apiConfiguration.anthropicBeta1MContext ? "Yes" : "No",
			actualValue: apiConfiguration.anthropicBeta1MContext ? "true" : "false",
			type: "boolean" as const,
		},
	]

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

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>Anthropic Settings</Text>

			{!apiConfiguration.apiKey && (
				<Box flexDirection="column" gap={1} marginBottom={1}>
					<Text color="yellow">⚠ No API key configured</Text>
					<Text color="gray" dimColor>
						Get your API key at: https://console.anthropic.com/settings/keys
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
					<Text color={selectedSettingIndex === index ? "cyan" : "gray"}>{setting.value}</Text>
				</Box>
			))}
		</Box>
	)
}
