import React from "react"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useSidebar } from "../../context/index.js"
import { SettingsLayout } from "./settings/common/SettingsLayout.js"
import { getSectionComponent } from "../../../constants/index.js"

interface GenericSettingsViewProps {
	section: string
	title: string
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

	const SectionComponent = getSectionComponent(section)

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
