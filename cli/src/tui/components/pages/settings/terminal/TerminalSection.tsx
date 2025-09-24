import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const TerminalSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Terminal" description="Configure terminal integration and shell settings" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Terminal integration settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Output line limits
						</Text>
						<Text color="gray" dimColor>
							• Shell integration settings
						</Text>
						<Text color="gray" dimColor>
							• Command delay configuration
						</Text>
						<Text color="gray" dimColor>
							• Terminal-specific options
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
