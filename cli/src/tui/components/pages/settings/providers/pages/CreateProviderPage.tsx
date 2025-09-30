import React, { useState, useEffect } from "react"
import { Box } from "ink"
import { Text } from "../../../../common/Text.js"
import TextInput from "ink-text-input"
import { PageHeader } from "../../../../generic/PageHeader.js"
import { PageLayout } from "../../../../layout/PageLayout.js"
import { SettingsLayout } from "../../common/SettingsLayout.js"
import { SectionHeader } from "../../common/SectionHeader.js"
import { Section } from "../../common/Section.js"
import { useKeyboardNavigation } from "../../../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../../context/index.js"
import { useRouter } from "../../../../../router/index.js"

export const CreateProviderPage: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const router = useRouter()
	const [profileName, setProfileName] = useState("")
	const [error, setError] = useState<string | null>(null)

	const listApiConfigMeta = extensionState?.listApiConfigMeta || []

	// Reset state when component mounts
	useEffect(() => {
		setProfileName("")
		setError(null)
	}, [])

	const validateName = (name: string): string | null => {
		const trimmed = name.trim()
		if (!trimmed) return "Profile name cannot be empty"

		const nameExists = listApiConfigMeta.some((profile) => profile.name.toLowerCase() === trimmed.toLowerCase())

		if (nameExists) return "Profile name already exists"

		return null
	}

	const handleSubmit = async () => {
		const validationError = validateName(profileName)
		if (validationError) {
			setError(validationError)
			return
		}

		try {
			await sendMessage({
				type: "upsertApiConfiguration",
				text: profileName.trim(),
				apiConfiguration: {},
			})
			// Navigate back to providers list on success
			router.goBack()
		} catch (error) {
			console.error("Failed to create profile:", error)
			setError("Failed to create profile")
		}
	}

	const handleCancel = () => {
		router.goBack()
	}

	// Keyboard navigation
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			return: () => {
				handleSubmit()
			},
			escape: () => {
				handleCancel()
			},
		},
	})

	const header = <PageHeader title="Settings - Providers - Create Profile" />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<Box flexDirection="column">
				<SectionHeader
					title="Create New Profile"
					description="Enter a name for your new provider configuration profile"
				/>
				<Section>
					<Box flexDirection="column" gap={1}>
						<Text>Profile Name:</Text>
						<TextInput
							value={profileName}
							onChange={setProfileName}
							onSubmit={handleSubmit}
							placeholder="Enter profile name..."
						/>

						{error && <Text color="red">Error: {error}</Text>}

						<Box justifyContent="flex-start" gap={4} marginTop={1}>
							<Text color="gray" dimColor>
								[Esc] Cancel
							</Text>
							<Text color="gray" dimColor>
								[Enter] Create
							</Text>
						</Box>
					</Box>
				</Section>
			</Box>
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
