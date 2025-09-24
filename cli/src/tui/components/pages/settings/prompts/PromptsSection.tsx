import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const PromptsSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Prompts" description="Configure custom prompts and prompt settings" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Custom prompt configuration</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Custom support prompts
						</Text>
						<Text color="gray" dimColor>
							• Prompt templates
						</Text>
						<Text color="gray" dimColor>
							• Task history in prompts
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
