import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

export const McpServersSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="MCP Servers" description="Manage Model Context Protocol server connections" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">MCP server management</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Server connection management
						</Text>
						<Text color="gray" dimColor>
							• Tool and resource configuration
						</Text>
						<Text color="gray" dimColor>
							• Server status monitoring
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
