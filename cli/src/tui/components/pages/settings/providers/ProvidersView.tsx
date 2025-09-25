import React, { useState, useEffect, useRef } from "react"
import { PageHeader } from "../../../generic/PageHeader.js"
import { PageLayout } from "../../../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../context/index.js"
import { useNavigate } from "../../../../router/index.js"
import { ProvidersSection } from "./ProvidersSection.js"
import { SettingsLayout } from "../common/SettingsLayout.js"
import {
	getProviderLabel,
	getProviderSettings,
	providerSupportsModelList,
	getModelFieldForProvider,
	type ProviderSettingConfig,
} from "../../../../../constants/providers/index.js"
import type { ProviderName, ProviderSettingsEntry } from "../../../../../types/messages.js"

interface ProvidersState {
	selectedIndex: number
}

export const ProvidersView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const navigate = useNavigate()
	const [providersState, setProvidersState] = useState<ProvidersState>({
		selectedIndex: 0,
	})

	const apiConfig = extensionState?.apiConfiguration || {}
	const currentApiConfigName = extensionState?.currentApiConfigName || "default"
	const listApiConfigMeta = extensionState?.listApiConfigMeta || []

	// Track the previous API config name to detect when it changes (indicating a successful save)
	const prevApiConfigName = useRef(currentApiConfigName)

	// Track API config changes
	useEffect(() => {
		prevApiConfigName.current = currentApiConfigName
	}, [currentApiConfigName])

	// Helper functions (moved before usage) - now using centralized constants

	// Build the linear navigation options
	const buildNavigationOptions = (): Array<{
		id: string
		type: "field" | "action"
		label: string
		value: string
		field?: string
		actualValue?: string
		action?: () => void
	}> => {
		const options = []

		// Profile management options
		options.push({
			id: "profile-select",
			type: "field" as const,
			label: "Profile",
			value: currentApiConfigName,
			action: () => {
				// Cycle through profiles
				const currentIndex = listApiConfigMeta.findIndex((p) => p.name === currentApiConfigName)
				const nextIndex = (currentIndex + 1) % Math.max(1, listApiConfigMeta.length)
				if (listApiConfigMeta[nextIndex]) {
					handleSelectProfile(listApiConfigMeta[nextIndex].name)
				}
			},
		})

		options.push({
			id: "profile-create",
			type: "action" as const,
			label: "Create New Profile",
			value: "",
			action: () => navigate("/settings/providers/create"),
		})

		options.push({
			id: "profile-rename",
			type: "action" as const,
			label: "Rename Profile",
			value: "",
			action: () => navigate("/settings/providers/edit"),
		})

		if (listApiConfigMeta.length > 1) {
			options.push({
				id: "profile-delete",
				type: "action" as const,
				label: "Delete Profile",
				value: "",
				action: () => navigate("/settings/providers/remove"),
			})
		}

		// Provider selection
		const currentProvider = apiConfig.apiProvider as ProviderName
		const providerLabel = getProviderLabel(currentProvider)

		options.push({
			id: "provider-select",
			type: "field" as const,
			label: "Provider",
			value: providerLabel,
			action: () => navigate("/settings/providers/choose"),
		})

		// Provider-specific settings
		if (currentProvider) {
			const providerSettings = getProviderSettings(currentProvider, apiConfig)
			const supportsModelList = providerSupportsModelList(currentProvider)
			const modelField = getModelFieldForProvider(currentProvider)

			providerSettings.forEach((setting: ProviderSettingConfig) => {
				const isModelField = supportsModelList && setting.field === modelField

				options.push({
					id: "provider-setting",
					type: "field" as const,
					label: setting.label,
					value: isModelField ? `${setting.value}` : setting.value,
					field: setting.field,
					actualValue: setting.actualValue,
					action: () => {
						if (isModelField) {
							console.log(`DEBUG ProvidersView: Navigating to model selector for ${setting.field}`)
							navigate(
								`/settings/providers/choose-model?provider=${currentProvider}&field=${setting.field}`,
							)
						} else {
							navigate(`/settings/providers/field/${setting.field}`)
						}
					},
				})
			})
		}

		return options
	}

	const navigationOptions = buildNavigationOptions()

	// Profile management functions
	const handleSelectProfile = async (profileName: string) => {
		try {
			await sendMessage({
				type: "loadApiConfiguration",
				text: profileName,
			})
		} catch (error) {
			console.error("Failed to load profile:", error)
		}
	}

	// Simple keyboard navigation - just ↑/↓ and Enter
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			return: () => {
				// Execute the action for the selected option
				const selectedOption = navigationOptions[providersState.selectedIndex]
				if (selectedOption?.action) {
					selectedOption.action()
				}
			},
			escape: () => {
				// Note: App.tsx handles Esc for going back to previous route
			},
			upArrow: () => {
				setProvidersState((prev) => ({
					...prev,
					selectedIndex: Math.max(0, prev.selectedIndex - 1),
				}))
			},
			downArrow: () => {
				setProvidersState((prev) => ({
					...prev,
					selectedIndex: Math.min(navigationOptions.length - 1, prev.selectedIndex + 1),
				}))
			},
		},
	})

	const header = <PageHeader title="Settings - Providers" />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<ProvidersSection navigationOptions={navigationOptions} selectedIndex={providersState.selectedIndex} />
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
