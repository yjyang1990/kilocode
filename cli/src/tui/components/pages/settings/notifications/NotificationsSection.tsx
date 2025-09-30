import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const NotificationsSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Notifications" description="Configure sound and notification preferences" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Sound and notification settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Sound enabled/disabled
						</Text>
						<Text color="gray" dimColor>
							• Text-to-speech settings
						</Text>
						<Text color="gray" dimColor>
							• System notifications
						</Text>
						<Text color="gray" dimColor>
							• Volume controls
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
