import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"
import SelectInput from "ink-select-input"
import type { ExtensionState, WebviewMessage, McpServer } from "../../types/messages.js"

interface McpViewProps {
	extensionState: ExtensionState | null
	sendMessage: (message: WebviewMessage) => Promise<void>
	onBack: () => void
	sidebarVisible?: boolean
}

interface McpState {
	servers: McpServer[]
	selectedIndex: number
	showingDetails: boolean
	selectedServer: McpServer | null
}

export const McpView: React.FC<McpViewProps> = ({ extensionState, sendMessage, onBack, sidebarVisible = false }) => {
	const [mcpState, setMcpState] = useState<McpState>({
		servers: [],
		selectedIndex: 0,
		showingDetails: false,
		selectedServer: null,
	})

	useEffect(() => {
		const servers = extensionState?.mcpServers || []
		setMcpState((prev) => ({ ...prev, servers }))
	}, [extensionState?.mcpServers])

	const handleServerSelect = (item: any) => {
		const server = mcpState.servers.find((s) => s.name === item.value)
		if (server) {
			setMcpState((prev) => ({
				...prev,
				showingDetails: true,
				selectedServer: server,
			}))
		}
	}

	const handleToggleServer = async (serverName: string, disabled: boolean) => {
		try {
			await sendMessage({
				type: "toggleMcpServer",
				serverName,
				disabled: !disabled,
				source: "global",
			})
		} catch (error) {
			console.error("Failed to toggle server:", error)
		}
	}

	const handleRestartServer = async (serverName: string) => {
		try {
			await sendMessage({
				type: "restartMcpServer",
				text: serverName,
				source: "global",
			})
		} catch (error) {
			console.error("Failed to restart server:", error)
		}
	}

	useInput((input, key) => {
		// Don't handle input when sidebar is visible
		if (sidebarVisible) return

		if (input === "t" && mcpState.selectedServer) {
			handleToggleServer(mcpState.selectedServer.name, mcpState.selectedServer.disabled || false)
		} else if (input === "r" && mcpState.selectedServer) {
			handleRestartServer(mcpState.selectedServer.name)
		}
	})

	if (mcpState.showingDetails && mcpState.selectedServer) {
		return (
			<Box flexDirection="column" height="100%">
				{/* Header */}
				<Box borderStyle="single" borderColor="blue" paddingX={1}>
					<Text color="blue" bold>
						🔌 MCP Server: {mcpState.selectedServer.name}
					</Text>
				</Box>

				{/* Server details */}
				<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
					<Box marginBottom={1}>
						<Text color="white" bold>
							Status:{" "}
						</Text>
						<Text color={mcpState.selectedServer.disabled ? "red" : "green"}>
							{mcpState.selectedServer.disabled ? "Disabled" : "Enabled"}
						</Text>
					</Box>

					<Box marginBottom={1}>
						<Text color="white" bold>
							Command:{" "}
						</Text>
						<Text color="gray">{mcpState.selectedServer.command}</Text>
					</Box>

					{mcpState.selectedServer.args && mcpState.selectedServer.args.length > 0 && (
						<Box marginBottom={1}>
							<Text color="white" bold>
								Arguments:{" "}
							</Text>
							<Text color="gray">{mcpState.selectedServer.args.join(" ")}</Text>
						</Box>
					)}

					{mcpState.selectedServer.tools && mcpState.selectedServer.tools.length > 0 && (
						<Box flexDirection="column" marginBottom={1}>
							<Text color="white" bold>
								Tools ({mcpState.selectedServer.tools.length}):
							</Text>
							{mcpState.selectedServer.tools.slice(0, 5).map((tool) => (
								<Box key={tool.name} marginLeft={2}>
									<Text color="cyan">• {tool.name}</Text>
									{tool.description && <Text color="gray"> - {tool.description}</Text>}
								</Box>
							))}
							{mcpState.selectedServer.tools.length > 5 && (
								<Box marginLeft={2}>
									<Text color="gray">... and {mcpState.selectedServer.tools.length - 5} more</Text>
								</Box>
							)}
						</Box>
					)}
				</Box>

				{/* Footer */}
				<Box borderStyle="single" borderColor="gray" paddingX={1}>
					<Text color="gray">
						<Text color="blue">t</Text> to toggle, <Text color="yellow">r</Text> to restart
					</Text>
				</Box>
			</Box>
		)
	}

	const serverItems = mcpState.servers.map((server) => ({
		label: `${server.name} ${server.disabled ? "(disabled)" : "(enabled)"}`,
		value: server.name,
	}))

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="single" borderColor="blue" paddingX={1}>
				<Text color="blue" bold>
					🔌 MCP Servers ({mcpState.servers.length})
				</Text>
			</Box>

			{/* Server list */}
			<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
				{mcpState.servers.length === 0 ? (
					<Box flexDirection="column" alignItems="center" justifyContent="center" height="100%">
						<Text color="gray">🔌 No MCP servers configured</Text>
						<Text color="gray" dimColor>
							Configure MCP servers in settings to extend functionality
						</Text>
					</Box>
				) : (
					<>
						<Box marginBottom={1}>
							<Text color="gray">Select a server to view details:</Text>
						</Box>
						{sidebarVisible ? (
							<Box flexDirection="column">
								{serverItems.map((item, index) => (
									<Text key={item.value} color="white">
										{item.label}
									</Text>
								))}
							</Box>
						) : (
							<SelectInput items={serverItems} onSelect={handleServerSelect} />
						)}
					</>
				)}
			</Box>

			{/* Footer */}
			<Box borderStyle="single" borderColor="gray" paddingX={1}>
				<Text color="gray">
					<Text color="blue">Enter</Text> to view details
				</Text>
			</Box>
		</Box>
	)
}
