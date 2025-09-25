import React, { useState, useEffect, useMemo } from "react"
import { Box, Text } from "ink"
import { PageHeader } from "../../../../generic/PageHeader.js"
import { PageLayout } from "../../../../layout/PageLayout.js"
import { SettingsLayout } from "../../common/SettingsLayout.js"
import { SectionHeader } from "../../common/SectionHeader.js"
import { Section } from "../../common/Section.js"
import { useKeyboardNavigation } from "../../../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../../context/index.js"
import { useRouter } from "../../../../../router/index.js"
import { PROVIDER_OPTIONS, UI_CONSTANTS } from "../../../../../../constants/index.js"
import type { ProviderName } from "../../../../../../types/messages.js"

export const ChooseProviderPage: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const router = useRouter()
	const [selectedIndex, setSelectedIndex] = useState(0)

	const apiConfig = extensionState?.apiConfiguration || {}
	const currentApiConfigName = extensionState?.currentApiConfigName || "default"
	const currentProvider = apiConfig.apiProvider as ProviderName

	// Find current provider index when component mounts
	useEffect(() => {
		if (currentProvider) {
			const index = PROVIDER_OPTIONS.findIndex((p) => p.value === currentProvider)
			setSelectedIndex(index >= 0 ? index : 0)
		}
	}, [currentProvider])

	// Calculate visible providers for scrolling
	const visibleProviders = useMemo(() => {
		const startIndex = Math.max(
			0,
			Math.min(
				selectedIndex - Math.floor(UI_CONSTANTS.VISIBLE_ITEMS / 2),
				PROVIDER_OPTIONS.length - UI_CONSTANTS.VISIBLE_ITEMS,
			),
		)
		const endIndex = Math.min(startIndex + UI_CONSTANTS.VISIBLE_ITEMS, PROVIDER_OPTIONS.length)
		return {
			providers: PROVIDER_OPTIONS.slice(startIndex, endIndex),
			startIndex,
			endIndex,
		}
	}, [selectedIndex])

	const handleSelect = async () => {
		const selectedProvider = PROVIDER_OPTIONS[selectedIndex]
		if (selectedProvider) {
			try {
				const updatedConfig = {
					...apiConfig,
					apiProvider: selectedProvider.value,
				}

				await sendMessage({
					type: "upsertApiConfiguration",
					text: currentApiConfigName,
					apiConfiguration: updatedConfig,
				})
				// Navigate back to providers list on success
				router.goBack()
			} catch (error) {
				console.error("Failed to change provider:", error)
			}
		}
	}

	const handleCancel = () => {
		router.goBack()
	}

	// Keyboard navigation
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			upArrow: () => {
				setSelectedIndex((prev) => Math.max(0, prev - 1))
			},
			downArrow: () => {
				setSelectedIndex((prev) => Math.min(PROVIDER_OPTIONS.length - 1, prev + 1))
			},
			return: () => {
				handleSelect()
			},
			escape: () => {
				handleCancel()
			},
		},
	})

	const header = <PageHeader title="Settings - Providers - Choose Provider" />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<Box flexDirection="column">
				<SectionHeader title="Select Provider" description="Choose your AI provider for this profile" />
				<Section>
					<Box flexDirection="column" gap={1}>
						<Box flexDirection="column" height={UI_CONSTANTS.VISIBLE_ITEMS}>
							{visibleProviders.providers.map((provider, relativeIndex) => {
								const actualIndex = visibleProviders.startIndex + relativeIndex
								const isSelected = actualIndex === selectedIndex
								return (
									<Box key={provider.value} paddingX={1}>
										<Text color={isSelected ? "cyan" : "white"}>
											{isSelected ? "❯ " : "  "}
											{provider.label}
											{provider.value === currentProvider ? " (current)" : ""}
										</Text>
									</Box>
								)
							})}
						</Box>

						{/* Scroll indicators */}
						<Box justifyContent="center" marginTop={1}>
							<Text color="gray" dimColor>
								{selectedIndex + 1} of {PROVIDER_OPTIONS.length}
								{visibleProviders.startIndex > 0 && " ↑"}
								{visibleProviders.endIndex < PROVIDER_OPTIONS.length && " ↓"}
							</Text>
						</Box>

						<Box justifyContent="flex-start" gap={4} marginTop={1}>
							<Text color="gray" dimColor>
								[↑/↓] Navigate
							</Text>
							<Text color="gray" dimColor>
								[Enter] Select
							</Text>
							<Text color="gray" dimColor>
								[Esc] Cancel
							</Text>
						</Box>
					</Box>
				</Section>
			</Box>
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
