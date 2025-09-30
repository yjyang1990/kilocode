import React from "react"
import { Box } from "ink"
import { Text } from "../../../../common/Text.js"
import { PageHeader } from "../../../../generic/PageHeader.js"
import { PageLayout } from "../../../../layout/PageLayout.js"
import { SettingsLayout } from "../../common/SettingsLayout.js"
import { useKeyboardNavigation } from "../../../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../../context/index.js"
import { useRouter } from "../../../../../router/index.js"

export const RemoveProviderPage: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const router = useRouter()

	const currentApiConfigName = extensionState?.currentApiConfigName || "default"

	const handleConfirm = async () => {
		try {
			await sendMessage({
				type: "deleteApiConfiguration",
				text: currentApiConfigName,
			})
			// Navigate back to providers list on success
			router.goBack()
		} catch (error) {
			console.error("Failed to delete profile:", error)
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
				handleConfirm()
			},
			escape: () => {
				handleCancel()
			},
		},
	})

	const header = <PageHeader title="Settings - Providers - Delete Profile" />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<Box flexDirection="column" gap={1}>
				<Box>
					<Text color="red" bold>
						Delete Profile
					</Text>
				</Box>

				<Box flexDirection="column" gap={1}>
					<Text>Are you sure you want to delete the profile "{currentApiConfigName}"?</Text>
					<Text color="red">This action cannot be undone.</Text>

					<Box justifyContent="flex-start" gap={4} marginTop={2}>
						<Text color="gray" dimColor>
							[Esc] Cancel
						</Text>
						<Text color="red">[Enter] Delete</Text>
					</Box>
				</Box>
			</Box>
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
