import React from "react"
import { Box, Text } from "ink"
import { PageHeader } from "../generic/PageHeader.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useExtensionState } from "../../context/index.js"
import { SettingsLayout } from "./settings/common/SettingsLayout.js"

export const SettingsIndex: React.FC = () => {
	const extensionState = useExtensionState()

	const header = <PageHeader title="Settings" />

	const content = (
		<SettingsLayout isIndexPage={true}>
			<Box flexDirection="column" paddingX={2} paddingY={1}>
				<Box flexDirection="column" gap={1}>
					<Text color="blue" bold>
						Welcome to Settings
					</Text>
					<Text color="gray">Configure your Kilo Code experience using the menu on the left.</Text>
				</Box>

				<Box flexDirection="column" gap={1} marginTop={2}>
					<Text bold>Quick Overview</Text>
					<Box flexDirection="column" gap={1}>
						<Box flexDirection="row" justifyContent="space-between">
							<Text>Version:</Text>
							<Text color="cyan">{extensionState?.version || "4.96.1"}</Text>
						</Box>
						<Box flexDirection="row" justifyContent="space-between">
							<Text>API Provider:</Text>
							<Text color="cyan">{extensionState?.apiConfiguration?.apiProvider || "kilocode"}</Text>
						</Box>
						<Box flexDirection="row" justifyContent="space-between">
							<Text>Model:</Text>
							<Text color="cyan">
								{extensionState?.apiConfiguration?.kilocodeModel || "anthropic/claude-sonnet-4"}
							</Text>
						</Box>
						<Box flexDirection="row" justifyContent="space-between">
							<Text>Telemetry:</Text>
							<Text color={extensionState?.telemetrySetting === "enabled" ? "green" : "red"}>
								{extensionState?.telemetrySetting === "enabled" ? "Enabled" : "Disabled"}
							</Text>
						</Box>
					</Box>
				</Box>

				<Box marginTop={2}>
					<Text color="yellow" dimColor>
						Use the left menu to navigate to specific settings sections
					</Text>
				</Box>
			</Box>
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
