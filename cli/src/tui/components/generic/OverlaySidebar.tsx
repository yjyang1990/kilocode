import React, { useState, useEffect } from "react"
import { Box, useInput } from "ink"
import { Text } from "../common/Text.js"
import { useNavigate, useCurrentPath } from "../../router/index.js"

interface MenuItem {
	id: string
	label: string
	icon: string
	description: string
	path?: string
}

interface OverlaySidebarProps {
	isVisible: boolean
	onSelectItem: (item: string) => void
	onClose: () => void
}

const menuItems: MenuItem[] = [
	{ id: "chat", label: "Chat", icon: "", description: "Start or continue conversations", path: "/chat" },
	{ id: "modes", label: "Modes", icon: "", description: "Switch between AI modes", path: "/modes" },
	{ id: "history", label: "History", icon: "", description: "View conversation history", path: "/history" },
	{ id: "settings", label: "Settings", icon: "", description: "Configure application", path: "/settings" },
	{ id: "logs", label: "Logs", icon: "", description: "View system logs", path: "/logs" },
	{ id: "exit", label: "Exit", icon: "", description: "Close Kilo Code CLI" },
]

export const OverlaySidebar: React.FC<OverlaySidebarProps> = ({ isVisible, onSelectItem, onClose }) => {
	const navigate = useNavigate()
	const currentPath = useCurrentPath()
	const [selectedIndex, setSelectedIndex] = useState(0)

	// Reset selection when sidebar becomes visible
	useEffect(() => {
		if (isVisible) {
			// Find current path index or default to 0
			const currentIndex = menuItems.findIndex((item) => item.path === currentPath)
			setSelectedIndex(currentIndex >= 0 ? currentIndex : 0)
		}
	}, [isVisible, currentPath])

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
					if (selectedItem.id === "exit") {
						onSelectItem("exit")
					} else if (selectedItem.path) {
						navigate(selectedItem.path)
						onClose()
					}
				}
			}
		},
		{ isActive: isVisible },
	)

	if (!isVisible) {
		return null
	}

	return (
		<Box minWidth={30} width={30} height="100%" borderStyle="single" borderColor="blue" flexDirection="column">
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
					const isCurrent =
						item.path === currentPath || (item.path === "/settings" && currentPath.startsWith("/settings"))

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
