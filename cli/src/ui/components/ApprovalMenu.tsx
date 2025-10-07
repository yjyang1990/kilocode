/**
 * ApprovalMenu component - displays approval/rejection options
 * Similar to AutocompleteMenu but for approve/reject actions
 */

import React from "react"
import { Box, Text } from "ink"
import type { ApprovalOption } from "../../state/atoms/approval.js"

interface ApprovalMenuProps {
	options: ApprovalOption[]
	selectedIndex: number
	visible: boolean
}

export const ApprovalMenu: React.FC<ApprovalMenuProps> = ({ options, selectedIndex, visible }) => {
	if (!visible || options.length === 0) {
		return null
	}

	return (
		<Box flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1}>
			<Text bold color="yellow">
				[!] Action Required:
			</Text>
			{options.map((option, index) => (
				<ApprovalOptionRow key={option.action} option={option} isSelected={index === selectedIndex} />
			))}
			<Box marginTop={1}>
				<Text color="gray" dimColor>
					↑↓ Navigate • y Approve • n Reject • Enter Select • Esc Cancel
				</Text>
			</Box>
		</Box>
	)
}

interface ApprovalOptionRowProps {
	option: ApprovalOption
	isSelected: boolean
}

const ApprovalOptionRow: React.FC<ApprovalOptionRowProps> = ({ option, isSelected }) => {
	const color = isSelected ? option.color : "white"
	const icon = option.action === "approve" ? "✓" : "✗"

	return (
		<Box>
			{isSelected && (
				<Text color={option.color} bold>
					{">"}{" "}
				</Text>
			)}
			{!isSelected && <Text>{"  "}</Text>}

			<Text color={color} bold={isSelected}>
				{icon} {option.label}
			</Text>

			<Text color="gray"> ({option.hotkey})</Text>
		</Box>
	)
}
