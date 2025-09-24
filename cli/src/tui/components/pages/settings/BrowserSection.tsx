import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "./SectionHeader.js"
import { Section } from "./Section.js"

export const BrowserSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Browser" description="Configure browser tool settings and viewport options" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Browser integration settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Browser tool enabled/disabled
						</Text>
						<Text color="gray" dimColor>
							• Viewport size configuration
						</Text>
						<Text color="gray" dimColor>
							• Screenshot quality settings
						</Text>
						<Text color="gray" dimColor>
							• Remote browser configuration
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
