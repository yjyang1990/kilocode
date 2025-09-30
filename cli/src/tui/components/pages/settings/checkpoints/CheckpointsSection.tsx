import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const CheckpointsSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Checkpoints" description="Configure checkpoint and version control settings" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Checkpoint and version control settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Enable/disable checkpoints
						</Text>
						<Text color="gray" dimColor>
							• Automatic checkpoint creation
						</Text>
						<Text color="gray" dimColor>
							• Checkpoint retention policies
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
