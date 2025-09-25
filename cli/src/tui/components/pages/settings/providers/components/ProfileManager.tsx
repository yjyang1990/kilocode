import React from "react"
import { Box, Text } from "ink"
import type { ProviderSettingsEntry } from "../../../../../../types/messages.js"

interface ProfileManagerProps {
	profiles: ProviderSettingsEntry[]
	currentProfile: string
	selectedProfileActionIndex: number
	focusMode: string
	onSelectProfile: (profileName: string) => void
	onCreateProfile: () => void
	onRenameProfile: () => void
	onDeleteProfile: () => void
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
	profiles,
	currentProfile,
	selectedProfileActionIndex,
	focusMode,
	onSelectProfile,
	onCreateProfile,
	onRenameProfile,
	onDeleteProfile,
}) => {
	const isOnlyProfile = profiles.length <= 1
	const profileActions = [
		{ label: "[+]", action: onCreateProfile, tooltip: "Create" },
		{ label: "[✏]", action: onRenameProfile, tooltip: "Rename" },
		{ label: "[🗑]", action: onDeleteProfile, tooltip: "Delete", disabled: isOnlyProfile },
	]

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>Configuration Profile</Text>

			<Box justifyContent="space-between" alignItems="center">
				{/* Profile Selection */}
				<Box flexDirection="row" alignItems="center" gap={1}>
					<Text color={focusMode === "profile-select" ? "cyan" : "white"}>
						{focusMode === "profile-select" ? "❯ " : "  "}
						{currentProfile || "No profile selected"}
					</Text>
				</Box>

				{/* Profile Actions */}
				<Box flexDirection="row" gap={1}>
					{profileActions.map((action, index) => (
						<Box key={index}>
							{action.disabled ? (
								<Text color="gray" dimColor>
									{action.label}
								</Text>
							) : (
								<Text
									color={
										focusMode === "profile-actions" && selectedProfileActionIndex === index
											? "cyan"
											: "white"
									}>
									{focusMode === "profile-actions" && selectedProfileActionIndex === index
										? "❯ "
										: ""}
									{action.label}
								</Text>
							)}
						</Box>
					))}
				</Box>
			</Box>

			<Text color="gray" dimColor>
				Save different API configurations to quickly switch between providers and settings.
			</Text>
		</Box>
	)
}
