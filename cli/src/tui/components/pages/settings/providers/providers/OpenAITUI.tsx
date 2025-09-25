import React from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { ProviderSettings } from "../../../../../../types/messages.js"

interface OpenAITUIProps {
	apiConfiguration: ProviderSettings
	editingField: string | null
	editingValue: string
	selectedSettingIndex: number
	onFieldEdit: (field: string, currentValue: string) => void
	onEditingValueChange: (value: string) => void
}

export const OpenAITUI: React.FC<OpenAITUIProps> = ({
	apiConfiguration,
	editingField,
	editingValue,
	selectedSettingIndex,
	onFieldEdit,
	onEditingValueChange,
}) => {
	const settings = [
		{
			field: "openAiNativeApiKey",
			label: "API Key",
			value: apiConfiguration.openAiNativeApiKey ? "••••••••" : "Not set",
			actualValue: apiConfiguration.openAiNativeApiKey || "",
			type: "password" as const,
		},
		{
			field: "apiModelId",
			label: "Model",
			value: apiConfiguration.apiModelId || "gpt-4o",
			actualValue: apiConfiguration.apiModelId || "",
			type: "text" as const,
		},
		{
			field: "openAiNativeBaseUrl",
			label: "Base URL",
			value: apiConfiguration.openAiNativeBaseUrl || "Default",
			actualValue: apiConfiguration.openAiNativeBaseUrl || "",
			type: "text" as const,
		},
		{
			field: "openAiNativeServiceTier",
			label: "Service Tier",
			value: apiConfiguration.openAiNativeServiceTier || "default",
			actualValue: apiConfiguration.openAiNativeServiceTier || "",
			type: "select" as const,
			options: ["default", "flex", "priority"],
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
					) : editingSetting?.type === "select" ? (
						<TextInput
							value={editingValue}
							onChange={onEditingValueChange}
							placeholder={editingSetting.options?.join("/") || ""}
						/>
					) : (
						<TextInput value={editingValue} onChange={onEditingValueChange} />
					)}
				</Box>
				<Text color="gray" dimColor>
					Press Enter to save, Escape to cancel
				</Text>
				{editingSetting?.type === "select" && editingSetting.options && (
					<Text color="gray" dimColor>
						Options: {editingSetting.options.join(", ")}
					</Text>
				)}
			</Box>
		)
	}

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>OpenAI Settings</Text>

			{!apiConfiguration.openAiNativeApiKey && (
				<Box flexDirection="column" gap={1} marginBottom={1}>
					<Text color="yellow">⚠ No API key configured</Text>
					<Text color="gray" dimColor>
						Get your API key at: https://platform.openai.com/api-keys
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
