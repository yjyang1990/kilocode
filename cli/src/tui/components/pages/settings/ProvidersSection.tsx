import React from "react"
import { Box, Text } from "ink"
import TextInput from "ink-text-input"
import type { ProviderSettings } from "../../../../types/messages.js"
import { SectionHeader } from "./SectionHeader.js"
import { Section } from "./Section.js"
import { SettingRow } from "./SettingRow.js"

interface ProvidersSectionProps {
	apiConfig: ProviderSettings
	editingField: string | null
	editingValue: string
	selectedSettingIndex: number
	onFieldEdit: (field: string, currentValue: string) => void
	onSaveField: () => void
	onEditingValueChange: (value: string) => void
}

export const ProvidersSection: React.FC<ProvidersSectionProps> = ({
	apiConfig,
	editingField,
	editingValue,
	selectedSettingIndex,
	onFieldEdit,
	onSaveField,
	onEditingValueChange,
}) => {
	const settings = [
		{
			field: "apiProvider",
			label: "API Provider",
			value: apiConfig.apiProvider || "kilocode",
			onEdit: () => onFieldEdit("apiProvider", apiConfig.apiProvider || ""),
		},
		{
			field: "kilocodeToken",
			label: "Kilo Code Token",
			value: apiConfig.kilocodeToken ? "••••••••" : "Not set",
			onEdit: () => onFieldEdit("kilocodeToken", apiConfig.kilocodeToken || ""),
		},
		{
			field: "kilocodeModel",
			label: "Model",
			value: apiConfig.kilocodeModel || "anthropic/claude-sonnet-4",
			onEdit: () => onFieldEdit("kilocodeModel", apiConfig.kilocodeModel || ""),
		},
		{
			field: "kilocodeOrganizationId",
			label: "Organization ID",
			value: apiConfig.kilocodeOrganizationId || "personal",
			onEdit: () => onFieldEdit("kilocodeOrganizationId", apiConfig.kilocodeOrganizationId || ""),
		},
	]

	return (
		<Box flexDirection="column">
			<SectionHeader title="Providers" description="Configure your AI provider settings" />
			<Section>
				{editingField ? (
					<Box flexDirection="column" gap={1}>
						<Text color="blue">Editing: {editingField}</Text>
						<Box>
							<Text>Value: </Text>
							<TextInput value={editingValue} onChange={onEditingValueChange} onSubmit={onSaveField} />
						</Box>
						<Text color="gray" dimColor>
							Press Enter to save, Escape to cancel
						</Text>
					</Box>
				) : (
					<Box flexDirection="column" gap={1}>
						{settings.map((setting, index) => (
							<SettingRow
								key={setting.field}
								label={setting.label}
								value={setting.value}
								onEdit={setting.onEdit}
								isEditing={editingField === setting.field}
								isSelected={selectedSettingIndex === index}
							/>
						))}
					</Box>
				)}
			</Section>
		</Box>
	)
}
