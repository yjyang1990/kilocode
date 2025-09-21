import React from "react"
import { Box, Text } from "ink"

type ViewType = "chat" | "history" | "settings" | "modes" | "mcp" | "logs"

interface NavigationProps {
	currentView: ViewType
	onViewChange: (view: ViewType) => void
}

const viewLabels: Record<ViewType, string> = {
	chat: "💬 Chat",
	history: "📚 History",
	settings: "⚙️ Settings",
	modes: "🎭 Modes",
	mcp: "🔌 MCP",
	logs: "🗒️ Logs",
}

const viewShortcuts: Record<ViewType, string> = {
	chat: "W",
	history: "E",
	settings: "R",
	modes: "T",
	mcp: "U",
	logs: "L",
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
	return (
		<Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
			<Text>
				{Object.entries(viewLabels).map(([view, label], index) => (
					<Text key={view}>
						<Text color={currentView === view ? "blue" : "gray"} bold={currentView === view}>
							{label}
						</Text>
						<Text color="gray" dimColor>
							(Ctrl+{viewShortcuts[view as ViewType]})
						</Text>
						{index < Object.entries(viewLabels).length - 1 && <Text color="gray"> | </Text>}
					</Text>
				))}
			</Text>
			<Text color="gray" dimColor>
				Ctrl+C/Q to exit
			</Text>
		</Box>
	)
}
