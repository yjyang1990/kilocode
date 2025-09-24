import React, { useState, useEffect, useRef } from "react"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../context/index.js"
import { ProvidersSection } from "./settings/ProvidersSection.js"
import { SettingsLayout } from "./settings/SettingsLayout.js"

interface ProvidersState {
	editingField: string | null
	editingValue: string
	focusMode: "sidebar" | "content"
	selectedSettingIndex: number
}

export const ProvidersView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const [providersState, setProvidersState] = useState<ProvidersState>({
		editingField: null,
		editingValue: "",
		focusMode: "content", // Start with content focused for this specific section
		selectedSettingIndex: 0,
	})

	const apiConfig = extensionState?.apiConfiguration || {}
	const currentApiConfigName = extensionState?.currentApiConfigName || "default"

	// Track the previous API config name to detect when it changes (indicating a successful save)
	const prevApiConfigName = useRef(currentApiConfigName)

	// Update the editing state when the API configuration changes (after successful save)
	useEffect(() => {
		// If we were editing a field and the API config name changed, it means the save was successful
		if (providersState.editingField && prevApiConfigName.current !== currentApiConfigName) {
			setProvidersState((prev) => ({
				...prev,
				editingField: null,
				editingValue: "",
			}))
		}
		prevApiConfigName.current = currentApiConfigName
	}, [currentApiConfigName, providersState.editingField])

	const handleFieldEdit = (field: string, currentValue: string) => {
		setProvidersState((prev) => ({
			...prev,
			editingField: field,
			editingValue: currentValue || "",
		}))
	}

	const handleSaveField = async () => {
		if (!providersState.editingField) return

		try {
			const updatedConfig = {
				...apiConfig,
				[providersState.editingField]: providersState.editingValue,
			}

			await sendMessage({
				type: "upsertApiConfiguration",
				text: extensionState?.currentApiConfigName || "default",
				apiConfiguration: updatedConfig,
			})

			setProvidersState((prev) => ({
				...prev,
				editingField: null,
				editingValue: "",
			}))
		} catch (error) {
			console.error("Failed to save setting:", error)
		}
	}

	const handleCancelEdit = () => {
		setProvidersState((prev) => ({
			...prev,
			editingField: null,
			editingValue: "",
		}))
	}

	const handleEditingValueChange = (value: string) => {
		setProvidersState((prev) => ({ ...prev, editingValue: value }))
	}

	// Keyboard navigation handlers
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			return: () => {
				if (providersState.editingField) {
					handleSaveField()
				} else if (providersState.focusMode === "content") {
					const settings = [
						{ field: "apiProvider", value: apiConfig.apiProvider || "" },
						{ field: "kilocodeToken", value: apiConfig.kilocodeToken || "" },
						{ field: "kilocodeModel", value: apiConfig.kilocodeModel || "" },
						{ field: "kilocodeOrganizationId", value: apiConfig.kilocodeOrganizationId || "" },
					]
					const selectedSetting = settings[providersState.selectedSettingIndex]
					if (selectedSetting) {
						handleFieldEdit(selectedSetting.field, selectedSetting.value)
					}
				}
			},
			escape: () => {
				if (providersState.editingField) {
					handleCancelEdit()
				}
			},
			// Remove left/right arrow handlers - column switching disabled in subsections
			upArrow: () => {
				if (providersState.focusMode === "content" && !providersState.editingField) {
					setProvidersState((prev) => ({
						...prev,
						selectedSettingIndex: Math.max(0, prev.selectedSettingIndex - 1),
					}))
				}
			},
			downArrow: () => {
				if (providersState.focusMode === "content" && !providersState.editingField) {
					const maxIndex = 3 // 4 settings (0-3)
					setProvidersState((prev) => ({
						...prev,
						selectedSettingIndex: Math.min(maxIndex, prev.selectedSettingIndex + 1),
					}))
				}
			},
		},
	})

	const header = <PageHeader title="Settings - Providers" />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<ProvidersSection
				apiConfig={apiConfig}
				editingField={providersState.editingField}
				editingValue={providersState.editingValue}
				selectedSettingIndex={providersState.selectedSettingIndex}
				onFieldEdit={handleFieldEdit}
				onSaveField={handleSaveField}
				onEditingValueChange={handleEditingValueChange}
			/>
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
