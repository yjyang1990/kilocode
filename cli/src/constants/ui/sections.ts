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
} from "../../tui/components/pages/settings/index.js"

/**
 * Settings section component mappings
 * Maps section slugs to their corresponding React components
 */
export const SECTION_COMPONENTS = {
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
} as const

/**
 * Type for section component keys
 */
export type SectionComponentKey = keyof typeof SECTION_COMPONENTS

/**
 * Get section component by key
 * @param section - Section key
 * @returns React component or undefined
 */
export const getSectionComponent = (section: string) => {
	return SECTION_COMPONENTS[section as SectionComponentKey]
}

/**
 * Check if section exists
 * @param section - Section key
 * @returns True if section exists
 */
export const sectionExists = (section: string): boolean => {
	return section in SECTION_COMPONENTS
}

/**
 * Get all available section keys
 * @returns Array of section keys
 */
export const getAllSectionKeys = (): string[] => {
	return Object.keys(SECTION_COMPONENTS)
}
