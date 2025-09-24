import React from "react"
import { Box, Text } from "ink"
import { SectionHeader } from "./SectionHeader.js"
import { Section } from "./Section.js"

export const NotificationsSection: React.FC = () => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Notifications" description="Configure sound and notification preferences" />
			<Section>
				<Box flexDirection="column" gap={1}>
					<Text color="gray">Sound and notification settings</Text>
					<Text color="yellow">Coming soon...</Text>
					<Box marginTop={1}>
						<Text color="gray" dimColor>
							This section will include:
						</Text>
						<Text color="gray" dimColor>
							• Sound enabled/disabled
						</Text>
						<Text color="gray" dimColor>
							• Text-to-speech settings
						</Text>
						<Text color="gray" dimColor>
							• System notifications
						</Text>
						<Text color="gray" dimColor>
							• Volume controls
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}

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
