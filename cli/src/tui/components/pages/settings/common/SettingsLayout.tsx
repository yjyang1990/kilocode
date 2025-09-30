import React, { useState } from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import SelectInput from "ink-select-input"
import { useNavigate, useCurrentPath } from "../../../../router/index.js"
import { useKeyboardNavigation } from "../../../../hooks/useKeyboardNavigation.js"
import { useSidebar } from "../../../../context/index.js"
import { useLastPath } from "../../../../router/RouterContext.js"
import { logService } from "../../../../../services/LogService.js"
import { DEFAULT_SECTION } from "../../../../../constants/index.js"

interface SettingsLayoutProps {
	children: React.ReactNode
	isIndexPage?: boolean
}

type SettingSection =
	| "providers"
	| "autoApprove"
	| "browser"
	| "checkpoints"
	| "display"
	| "notifications"
	| "context"
	| "terminal"
	| "prompts"
	| "experimental"
	| "language"
	| "mcpServers"
	| "about"

const sections: { value: SettingSection; label: string; path: string }[] = [
	{ value: "providers", label: "Providers", path: "/settings/providers" },
	{ value: "autoApprove", label: "Auto-Approve", path: "/settings/auto-approve" },
	{ value: "browser", label: "Browser", path: "/settings/browser" },
	{ value: "checkpoints", label: "Checkpoints", path: "/settings/checkpoints" },
	{ value: "display", label: "Display", path: "/settings/display" },
	{ value: "notifications", label: "Notifications", path: "/settings/notifications" },
	{ value: "context", label: "Context", path: "/settings/context" },
	{ value: "terminal", label: "Terminal", path: "/settings/terminal" },
	{ value: "prompts", label: "Prompts", path: "/settings/prompts" },
	{ value: "experimental", label: "Experimental", path: "/settings/experimental" },
	{ value: "language", label: "Language", path: "/settings/language" },
	{ value: "mcpServers", label: "MCP Servers", path: "/settings/mcp-servers" },
	{ value: "about", label: "About Kilo Code", path: "/settings/about" },
]

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, isIndexPage = false }) => {
	const navigate = useNavigate()
	const currentPath = useCurrentPath()
	const lastPath = useLastPath()
	const { visible: sidebarVisible } = useSidebar()
	const [focusMode, setFocusMode] = useState<"sidebar" | "content">(isIndexPage ? "sidebar" : "content")

	// Determine current section from path
	const getCurrentSection = (): SettingSection | null => {
		const section = sections.find((s) => s.path === currentPath)
		return section?.value || null
	}

	const currentSection = getCurrentSection()

	// Get the last visited settings section from router history
	const getLastVisitedSection = (): SettingSection | null => {
		if (!isIndexPage) return currentSection
		const section = sections.find((s) => s.path === lastPath)
		return section?.value || DEFAULT_SECTION
	}

	// Determine which section should be highlighted in the menu
	const highlightedSection = getLastVisitedSection()
	const highlightedSectionIndex = sections.findIndex((s) => s.value === highlightedSection) || 0

	const handleSectionSelect = (item: any) => {
		navigate(item.path)
	}

	// Keyboard navigation handlers - only enable column switching on index page
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: isIndexPage
			? {
					leftArrow: () => {
						setFocusMode("sidebar")
					},
					rightArrow: () => {
						setFocusMode("content")
					},
				}
			: {},
	})

	return (
		<Box flexDirection="row" flexGrow={1}>
			{/* Section sidebar */}
			<Box
				borderStyle="single"
				borderColor={isIndexPage && focusMode === "sidebar" ? "blue" : "gray"}
				width={25}
				minWidth={25}
				paddingX={1}
				paddingY={1}>
				{isIndexPage && focusMode === "sidebar" && !sidebarVisible ? (
					<SelectInput
						items={sections}
						onSelect={handleSectionSelect}
						initialIndex={highlightedSectionIndex}
					/>
				) : (
					<Box flexDirection="column">
						{sections.map((section) => (
							<Text key={section.value} color={section.value === highlightedSection ? "blue" : "gray"}>
								{section.value === highlightedSection ? "❯ " : "  "}
								{section.label}
							</Text>
						))}
					</Box>
				)}
			</Box>

			{/* Settings content */}
			<Box
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor={!isIndexPage || focusMode === "content" ? "blue" : "gray"}>
				{children}
			</Box>
		</Box>
	)
}
