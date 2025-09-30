import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"

interface SettingRowProps {
	label: string
	value: string
	onEdit: () => void
	isEditing: boolean
	isSelected: boolean
}

export const SettingRow: React.FC<SettingRowProps> = ({ label, value, onEdit, isEditing, isSelected }) => {
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
