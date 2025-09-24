import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const ContextSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Context" description="Configure context management and file handling" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Context management settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Auto-condense context settings
						</Text>
						<Text color="gray" dimColor>
							• Max workspace files
						</Text>
						<Text color="gray" dimColor>
							• File size limits
						</Text>
						<Text color="gray" dimColor>
							• Context window management
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
