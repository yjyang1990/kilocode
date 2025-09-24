import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "./SectionHeader.js"
import { Section } from "./Section.js"

export const AutoApproveSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader
				title="Auto-Approve"
				description="Configure automatic approval settings for various operations"
			/>
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Auto-approval settings, permissions, etc.</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Always allow read-only operations
						</Text>
						<Text color="gray" dimColor>
							• Always allow write operations
						</Text>
						<Text color="gray" dimColor>
							• Always allow browser access
						</Text>
						<Text color="gray" dimColor>
							• Always allow command execution
						</Text>
						<Text color="gray" dimColor>
							• Request delay settings
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
