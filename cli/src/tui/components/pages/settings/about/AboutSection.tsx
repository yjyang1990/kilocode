import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

interface AboutSectionProps {
	version?: string
	telemetrySetting?: string
	onExportSettings?: () => void
	onImportSettings?: () => void
	onResetState?: () => void
	onToggleTelemetry?: () => void
}

export const AboutSection: React.FC<AboutSectionProps> = ({
	version = "4.96.1",
	telemetrySetting = "enabled",
	onExportSettings,
	onImportSettings,
	onResetState,
	onToggleTelemetry,
}) => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="About Kilo Code" description={`Version: ${version}`} />
			<Section>
				<Box flexDirection="column" gap={1}>
					{/* Telemetry Setting */}
					<Box flexDirection="column" gap={1}>
						<Text bold>Telemetry</Text>
						<Box flexDirection="row" alignItems="center" gap={2}>
							<Text color={telemetrySetting === "enabled" ? "green" : "red"}>
								{telemetrySetting === "enabled" ? "✓" : "✗"}
							</Text>
							<Text>{telemetrySetting === "enabled" ? "Enabled" : "Disabled"}</Text>
						</Box>
						<Text color="gray" dimColor>
							Help improve Kilo Code by sharing anonymous usage data.
						</Text>
						<Text color="gray" dimColor>
							Privacy policy: https://kilocode.ai/privacy
						</Text>
					</Box>

					{/* Support Links */}
					<Box flexDirection="column" gap={1} marginTop={1}>
						<Text bold>Support & Community</Text>
						<Text color="gray">• GitHub: https://github.com/Kilo-Org/kilocode</Text>
						<Text color="gray">• Discord: https://kilocode.ai/discord</Text>
						<Text color="gray">• Reddit: https://reddit.com/r/kilocode</Text>
						<Text color="gray">• Support: https://kilocode.ai/support</Text>
					</Box>

					{/* Settings Management */}
					<Box flexDirection="column" gap={1} marginTop={1}>
						<Text bold>Settings Management</Text>
						<Text color="gray" dimColor>
							Export, import, or reset your settings
						</Text>
						<Box flexDirection="row" gap={2} marginTop={1}>
							<Text color="blue">[E] Export Settings</Text>
							<Text color="blue">[I] Import Settings</Text>
							<Text color="red">[R] Reset All</Text>
						</Box>
					</Box>

					{/* Instructions */}
					<Box marginTop={1}>
						<Text color="yellow" dimColor>
							Press the corresponding key to perform actions
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
