// Terminal-compatible icons using Unicode symbols
export const MessageIcons = {
	// Basic message types
	user: "👤",
	assistant: "🤖",
	system: "⚙️",
	error: "❌",
	warning: "⚠️",
	success: "✅",
	info: "ℹ️",

	// Tool operations
	file: "📄",
	folder: "📁",
	edit: "✏️",
	create: "➕",
	delete: "🗑️",
	search: "🔍",
	terminal: "💻",
	browser: "🌐",

	// Status indicators
	loading: "⏳",
	processing: "🔄",
	completed: "✅",
	cancelled: "🚫",
	partial: "⋯",

	// API and cost
	api: "🔗",
	cost: "💰",
	tokens: "🎯",
	cache: "💾",

	// Actions
	approve: "👍",
	reject: "👎",
	question: "❓",

	// Fallback
	default: "•",
} as const

// Box drawing characters for borders and separators
export const BoxChars = {
	horizontal: "─",
	vertical: "│",
	topLeft: "┌",
	topRight: "┐",
	bottomLeft: "└",
	bottomRight: "┘",
	cross: "┼",
	teeUp: "┴",
	teeDown: "┬",
	teeLeft: "┤",
	teeRight: "├",

	// Double lines for emphasis
	doubleHorizontal: "═",
	doubleVertical: "║",
	doubleTopLeft: "╔",
	doubleTopRight: "╗",
	doubleBottomLeft: "╚",
	doubleBottomRight: "╝",
} as const

// Progress indicators
export const ProgressChars = {
	spinner: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
	dots: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
	bar: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"],
} as const
