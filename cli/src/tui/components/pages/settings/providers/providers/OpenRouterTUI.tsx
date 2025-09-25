import React from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { ProviderSettings } from "../../../../../../types/messages.js"

interface OpenRouterTUIProps {
	apiConfiguration: ProviderSettings
	editingField: string | null
	editingValue: string
	selectedSettingIndex: number
	onFieldEdit: (field: string, currentValue: string) => void
	onEditingValueChange: (value: string) => void
}

export const OpenRouterTUI: React.FC<OpenRouterTUIProps> = ({
	apiConfiguration,
	editingField,
	editingValue,
	selectedSettingIndex,
	onFieldEdit,
	onEditingValueChange,
}) => {
	const settings = [
		{
			field: "openRouterApiKey",
			label: "API Key",
			value: apiConfiguration.openRouterApiKey ? "••••••••" : "Not set",
			actualValue: apiConfiguration.openRouterApiKey || "",
			type: "password" as const,
		},
		{
			field: "openRouterModelId",
			label: "Model",
			value: apiConfiguration.openRouterModelId || "anthropic/claude-3-5-sonnet",
			actualValue: apiConfiguration.openRouterModelId || "",
			type: "text" as const,
		},
		{
			field: "openRouterBaseUrl",
			label: "Base URL",
			value: apiConfiguration.openRouterBaseUrl || "Default",
			actualValue: apiConfiguration.openRouterBaseUrl || "",
			type: "text" as const,
		},
		{
			field: "openRouterUseMiddleOutTransform",
			label: "Use Middle-Out Transform",
			value: apiConfiguration.openRouterUseMiddleOutTransform !== false ? "Yes" : "No",
			actualValue: apiConfiguration.openRouterUseMiddleOutTransform !== false ? "true" : "false",
			type: "boolean" as const,
		},
		{
			field: "openRouterSpecificProvider",
			label: "Specific Provider",
			value: apiConfiguration.openRouterSpecificProvider || "Auto",
			actualValue: apiConfiguration.openRouterSpecificProvider || "",
			type: "text" as const,
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
			<Text bold>OpenRouter Settings</Text>

			{!apiConfiguration.openRouterApiKey && (
				<Box flexDirection="column" gap={1} marginBottom={1}>
					<Text color="yellow">⚠ No API key configured</Text>
					<Text color="gray" dimColor>
						Get your API key at: https://openrouter.ai/keys
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
