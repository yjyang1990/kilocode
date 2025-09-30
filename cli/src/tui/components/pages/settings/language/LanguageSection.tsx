import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const LanguageSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Language" description="Configure language and localization preferences" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Language and localization settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Interface language selection
						</Text>
						<Text color="gray" dimColor>
							• Regional preferences
						</Text>
						<Text color="gray" dimColor>
							• Date/time formatting
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
