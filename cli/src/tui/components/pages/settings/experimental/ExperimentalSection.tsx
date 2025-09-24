import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const ExperimentalSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Experimental" description="Enable experimental features and beta functionality" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Experimental features and settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Feature flags
						</Text>
						<Text color="gray" dimColor>
							• Beta functionality toggles
						</Text>
						<Text color="gray" dimColor>
							• Advanced experimental options
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
