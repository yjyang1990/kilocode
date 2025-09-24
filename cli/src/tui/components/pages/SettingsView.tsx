import React, { useState, useEffect, useRef } from "react"
import { Box, Text } from "ink"
import SelectInput from "ink-select-input"
import TextInput from "ink-text-input"
import type { ProviderSettings } from "../../../types/messages.js"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar, useViewNavigation } from "../../context/index.js"
import {
	ProvidersSection,
	AboutSection,
	AutoApproveSection,
	BrowserSection,
	CheckpointsSection,
	DisplaySection,
	NotificationsSection,
	ContextSection,
	TerminalSection,
	PromptsSection,
	ExperimentalSection,
	LanguageSection,
	McpServersSection,
} from "./settings/index.js"

type SettingSection =
	| "providers"
	| "autoApprove"
	| "browser"
	| "checkpoints"
	| "display"
	| "notifications"
	| "context"
	| "terminal"
	| "prompts"
	| "experimental"
	| "language"
	| "mcpServers"
	| "about"

interface SettingsState {
	currentSection: SettingSection
	editingField: string | null
	editingValue: string
	focusMode: "sidebar" | "content"
	selectedSettingIndex: number
}

const sections: { value: SettingSection; label: string }[] = [
	{ value: "providers", label: "Providers" },
	{ value: "autoApprove", label: "Auto-Approve" },
	{ value: "browser", label: "Browser" },
	{ value: "checkpoints", label: "Checkpoints" },
	{ value: "display", label: "Display" },
	{ value: "notifications", label: "Notifications" },
	{ value: "context", label: "Context" },
	{ value: "terminal", label: "Terminal" },
	{ value: "prompts", label: "Prompts" },
	{ value: "experimental", label: "Experimental" },
	{ value: "language", label: "Language" },
	{ value: "mcpServers", label: "MCP Servers" },
	{ value: "about", label: "About Kilo Code" },
]

export const SettingsView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const { goBack } = useViewNavigation()
	const [settingsState, setSettingsState] = useState<SettingsState>({
		currentSection: "providers",
		editingField: null,
		editingValue: "",
		focusMode: "sidebar", // Start with sidebar focused for navigation
		selectedSettingIndex: 0,
	})

	const apiConfig = extensionState?.apiConfiguration || {}
	const currentApiConfigName = extensionState?.currentApiConfigName || "default"

	// Track the previous API config name to detect when it changes (indicating a successful save)
	const prevApiConfigName = useRef(currentApiConfigName)

	// Update the editing state when the API configuration changes (after successful save)
	useEffect(() => {
		// If we were editing a field and the API config name changed, it means the save was successful
		if (settingsState.editingField && prevApiConfigName.current !== currentApiConfigName) {
			setSettingsState((prev) => ({
				...prev,
				editingField: null,
				editingValue: "",
			}))
		}
		prevApiConfigName.current = currentApiConfigName
	}, [currentApiConfigName, settingsState.editingField])

	const handleSectionSelect = (item: any) => {
		setSettingsState((prev) => ({
			...prev,
			currentSection: item.value,
			selectedSettingIndex: 0, // Reset selection when changing sections
		}))
	}

	const handleFieldEdit = (field: string, currentValue: string) => {
		setSettingsState((prev) => ({
			...prev,
			editingField: field,
			editingValue: currentValue || "",
		}))
	}

	const handleSaveField = async () => {
		if (!settingsState.editingField) return

		try {
			const updatedConfig = {
				...apiConfig,
				[settingsState.editingField]: settingsState.editingValue,
			}

			await sendMessage({
				type: "upsertApiConfiguration",
				text: extensionState?.currentApiConfigName || "default",
				apiConfiguration: updatedConfig,
			})

			setSettingsState((prev) => ({
				...prev,
				editingField: null,
				editingValue: "",
			}))
		} catch (error) {
			console.error("Failed to save setting:", error)
		}
	}

	const handleCancelEdit = () => {
		setSettingsState((prev) => ({
			...prev,
			editingField: null,
			editingValue: "",
		}))
	}

	const handleEditingValueChange = (value: string) => {
		setSettingsState((prev) => ({ ...prev, editingValue: value }))
	}

	// Keyboard navigation handlers
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			return: () => {
				if (settingsState.editingField) {
					handleSaveField()
				} else if (settingsState.focusMode === "content" && settingsState.currentSection === "providers") {
					// Only allow editing in providers section for now
					const settings = [
						{ field: "apiProvider", value: apiConfig.apiProvider || "" },
						{ field: "kilocodeToken", value: apiConfig.kilocodeToken || "" },
						{ field: "kilocodeModel", value: apiConfig.kilocodeModel || "" },
						{ field: "kilocodeOrganizationId", value: apiConfig.kilocodeOrganizationId || "" },
					]
					const selectedSetting = settings[settingsState.selectedSettingIndex]
					if (selectedSetting) {
						handleFieldEdit(selectedSetting.field, selectedSetting.value)
					}
				}
			},
			escape: () => {
				if (settingsState.editingField) {
					handleCancelEdit()
				}
			},
			leftArrow: () => {
				if (!settingsState.editingField) {
					setSettingsState((prev) => ({ ...prev, focusMode: "sidebar" }))
				}
			},
			rightArrow: () => {
				if (!settingsState.editingField) {
					setSettingsState((prev) => ({ ...prev, focusMode: "content" }))
				}
			},
			upArrow: () => {
				if (settingsState.focusMode === "content" && !settingsState.editingField) {
					setSettingsState((prev) => ({
						...prev,
						selectedSettingIndex: Math.max(0, prev.selectedSettingIndex - 1),
					}))
				}
			},
			downArrow: () => {
				if (settingsState.focusMode === "content" && !settingsState.editingField) {
					// Only allow navigation in providers section for now
					const maxIndex = settingsState.currentSection === "providers" ? 3 : 0
					setSettingsState((prev) => ({
						...prev,
						selectedSettingIndex: Math.min(maxIndex, prev.selectedSettingIndex + 1),
					}))
				}
			},
		},
	})

	const renderCurrentSection = () => {
		const commonProps = {
			editingField: settingsState.editingField,
			editingValue: settingsState.editingValue,
			selectedSettingIndex: settingsState.selectedSettingIndex,
			onFieldEdit: handleFieldEdit,
			onSaveField: handleSaveField,
			onEditingValueChange: handleEditingValueChange,
		}

		switch (settingsState.currentSection) {
			case "providers":
				return <ProvidersSection apiConfig={apiConfig} {...commonProps} />
			case "about":
				return (
					<AboutSection
						version={extensionState?.version || "4.96.1"}
						telemetrySetting={extensionState?.telemetrySetting || "enabled"}
						onExportSettings={() => sendMessage({ type: "exportSettings" })}
						onImportSettings={() => sendMessage({ type: "importSettings" })}
						onResetState={() => sendMessage({ type: "resetState" })}
						onToggleTelemetry={() => {
							const newSetting = extensionState?.telemetrySetting === "enabled" ? "disabled" : "enabled"
							sendMessage({ type: "telemetrySetting", text: newSetting })
						}}
					/>
				)
			case "autoApprove":
				return <AutoApproveSection />
			case "browser":
				return <BrowserSection />
			case "checkpoints":
				return <CheckpointsSection />
			case "display":
				return <DisplaySection />
			case "notifications":
				return <NotificationsSection />
			case "context":
				return <ContextSection />
			case "terminal":
				return <TerminalSection />
			case "prompts":
				return <PromptsSection />
			case "experimental":
				return <ExperimentalSection />
			case "language":
				return <LanguageSection />
			case "mcpServers":
				return <McpServersSection />
			default:
				return <ProvidersSection apiConfig={apiConfig} {...commonProps} />
		}
	}

	// Create header
	const header = <PageHeader title="Settings" />

	// Create footer with action hints
	const footer = (
		<PageFooter
			actions={[
				{ key: "←→", label: "switch columns" },
				{ key: "↑↓", label: "navigate" },
				{ key: "Enter", label: "edit/save" },
				{ key: "Esc", label: "cancel" },
			]}
		/>
	)

	// Create main content
	const content = (
		<Box flexDirection="row" flexGrow={1}>
			{/* Section sidebar */}
			<Box
				borderStyle="single"
				borderColor={settingsState.focusMode === "sidebar" ? "blue" : "gray"}
				width={25}
				minWidth={25}
				paddingX={1}
				paddingY={1}>
				{settingsState.focusMode === "sidebar" && !sidebarVisible ? (
					<SelectInput items={sections} onSelect={handleSectionSelect} />
				) : (
					<Box flexDirection="column">
						{sections.map((section) => (
							<Text
								key={section.value}
								color={section.value === settingsState.currentSection ? "blue" : "gray"}>
								{section.value === settingsState.currentSection ? "❯" : " "}
								{section.label}
							</Text>
						))}
					</Box>
				)}
			</Box>

			{/* Settings content */}
			<Box
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor={settingsState.focusMode === "content" ? "blue" : "gray"}>
				{renderCurrentSection()}
			</Box>
		</Box>
	)

	return (
		<PageLayout header={header} footer={footer}>
			{content}
		</PageLayout>
	)
}
