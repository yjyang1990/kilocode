import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "./SectionHeader.js"
import { Section } from "./Section.js"

export const DisplaySection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Display" description="Configure display and UI preferences" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Display and UI settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Task timeline visibility
						</Text>
						<Text color="gray" dimColor>
							• Auto-approve menu display
						</Text>
						<Text color="gray" dimColor>
							• Theme preferences
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
