import React from "react"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useSidebar } from "../../context/index.js"
import { SettingsLayout } from "./settings/common/SettingsLayout.js"
import {
	AutoApproveSection,
	BrowserSection,
	CheckpointsSection,
	DisplaySection,
	NotificationsSection,
	ContextSection,
	TerminalSection,
	PromptsSection,
	ExperimentalSection,
	LanguageSection,
	McpServersSection,
} from "./settings/index.js"

interface GenericSettingsViewProps {
	section: string
	title: string
}

const sectionComponents = {
	"auto-approve": AutoApproveSection,
	browser: BrowserSection,
	checkpoints: CheckpointsSection,
	display: DisplaySection,
	notifications: NotificationsSection,
	context: ContextSection,
	terminal: TerminalSection,
	prompts: PromptsSection,
	experimental: ExperimentalSection,
	language: LanguageSection,
	"mcp-servers": McpServersSection,
}

export const GenericSettingsView: React.FC<GenericSettingsViewProps> = ({ section, title }) => {
	const { visible: sidebarVisible } = useSidebar()

	// Keyboard navigation handlers
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			// Basic navigation only for generic sections
		},
	})

	const SectionComponent = sectionComponents[section as keyof typeof sectionComponents]

	if (!SectionComponent) {
		return (
			<PageLayout header={<PageHeader title={`Settings - ${title}`} />}>
				<SettingsLayout>
					<div>Section not found: {section}</div>
				</SettingsLayout>
			</PageLayout>
		)
	}

	const header = <PageHeader title={`Settings - ${title}`} />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<SectionComponent />
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
