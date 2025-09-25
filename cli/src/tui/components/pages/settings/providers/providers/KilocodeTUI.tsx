import React from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { ProviderSettings } from "../../../../../../types/messages.js"

interface KilocodeTUIProps {
	apiConfiguration: ProviderSettings
	editingField: string | null
	editingValue: string
	selectedSettingIndex: number
	onFieldEdit: (field: string, currentValue: string) => void
	onEditingValueChange: (value: string) => void
}

export const KilocodeTUI: React.FC<KilocodeTUIProps> = ({
	apiConfiguration,
	editingField,
	editingValue,
	selectedSettingIndex,
	onFieldEdit,
	onEditingValueChange,
}) => {
	const settings = [
		{
			field: "kilocodeToken",
			label: "Kilo Code Token",
			value: apiConfiguration.kilocodeToken ? "••••••••" : "Not set",
			actualValue: apiConfiguration.kilocodeToken || "",
			type: "password" as const,
		},
		{
			field: "kilocodeOrganizationId",
			label: "Organization ID",
			value: apiConfiguration.kilocodeOrganizationId || "personal",
			actualValue: apiConfiguration.kilocodeOrganizationId || "",
			type: "text" as const,
		},
		{
			field: "kilocodeModel",
			label: "Model",
			value: apiConfiguration.kilocodeModel || "anthropic/claude-sonnet-4",
			actualValue: apiConfiguration.kilocodeModel || "",
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
			<Text bold>Kilo Code Settings</Text>

			{!apiConfiguration.kilocodeToken && (
				<Box flexDirection="column" gap={1} marginBottom={1}>
					<Text color="yellow">⚠ No Kilo Code token configured</Text>
					<Text color="gray" dimColor>
						Get your token at: https://app.kilocode.ai/profile
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
