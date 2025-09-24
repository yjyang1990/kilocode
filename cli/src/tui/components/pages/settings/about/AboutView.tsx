import React from "react"
import { PageHeader } from "../../../generic/PageHeader.js"
import { PageFooter } from "../../../generic/PageFooter.js"
import { PageLayout } from "../../../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../context/index.js"
import { AboutSection } from "./AboutSection.js"
import { SettingsLayout } from "../common/SettingsLayout.js"

export const AboutView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()

	// Keyboard navigation handlers
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			// Add specific keyboard handlers for About section actions
			e: () => {
				sendMessage({ type: "exportSettings" })
			},
			i: () => {
				sendMessage({ type: "importSettings" })
			},
			r: () => {
				sendMessage({ type: "resetState" })
			},
			t: () => {
				const newSetting = extensionState?.telemetrySetting === "enabled" ? "disabled" : "enabled"
				sendMessage({ type: "telemetrySetting", text: newSetting })
			},
		},
	})

	const header = <PageHeader title="Settings - About" />

	const content = (
		<SettingsLayout isIndexPage={false}>
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
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
