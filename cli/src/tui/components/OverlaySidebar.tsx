import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"

type ViewType = "chat" | "history" | "settings" | "modes" | "mcp" | "logs"

interface MenuItem {
	id: ViewType | "profile" | "exit"
	label: string
	icon: string
	description: string
}

interface OverlaySidebarProps {
	isVisible: boolean
	currentView: ViewType
	onSelectItem: (item: ViewType | "profile" | "exit") => void
	onClose: () => void
}

const menuItems: MenuItem[] = [
	{ id: "chat", label: "Chat", icon: "", description: "Start or continue conversations" },
	{ id: "modes", label: "Modes", icon: "", description: "Switch between AI modes" },
	{ id: "history", label: "History", icon: "", description: "View conversation history" },
	{ id: "profile", label: "Profile", icon: "", description: "User profile and settings" },
	{ id: "settings", label: "Settings", icon: "", description: "Configure application" },
	{ id: "logs", label: "Logs", icon: "", description: "View system logs" },
	{ id: "exit", label: "Exit", icon: "", description: "Close Kilo Code CLI" },
]

export const OverlaySidebar: React.FC<OverlaySidebarProps> = ({ isVisible, currentView, onSelectItem, onClose }) => {
	const [selectedIndex, setSelectedIndex] = useState(0)

	// Reset selection when sidebar becomes visible
	useEffect(() => {
		if (isVisible) {
			// Find current view index or default to 0
			const currentIndex = menuItems.findIndex((item) => item.id === currentView)
			setSelectedIndex(currentIndex >= 0 ? currentIndex : 0)
		}
	}, [isVisible, currentView])

	// Handle keyboard navigation
	useInput(
		(input, key) => {
			if (!isVisible) return

			if (key.upArrow) {
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1))
			} else if (key.downArrow) {
				setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0))
			} else if (key.return) {
				const selectedItem = menuItems[selectedIndex]
				if (selectedItem) {
					onSelectItem(selectedItem.id)
				}
			}
		},
		{ isActive: isVisible },
	)

	if (!isVisible) {
		return null
	}

	return (
		<Box width={30} height="100%" borderStyle="single" borderColor="blue" flexDirection="column">
			{/* Header */}
			<Box justifyContent="center">
				<Text color="blue" bold>
					Kilo Code
				</Text>
			</Box>

			{/* Menu Items */}
			<Box flexDirection="column" paddingX={1} paddingY={1} flexGrow={1}>
				{menuItems.map((item, index) => {
					const isSelected = index === selectedIndex
					const isCurrent = item.id === currentView

					return (
						<Box key={item.id} marginBottom={1}>
							<Box width="100%" flexDirection="column">
								<Text
									color={isSelected ? "blue" : isCurrent ? "cyan" : "white"}
									bold={isSelected || isCurrent}>
									{isSelected ? "❯ " : "  "}
									{item.label}
								</Text>
								<Box paddingLeft={2}>
									<Text color="gray" dimColor>
										{item.description}
									</Text>
								</Box>
							</Box>
						</Box>
					)
				})}
			</Box>
		</Box>
	)
}
