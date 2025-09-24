import React, { useState, useEffect } from "react"
import { Box, Text } from "ink"
import SelectInput from "ink-select-input"
import type { McpServer } from "../../../types/messages.js"
import { PageHeader } from "../generic/PageHeader.js"
import { PageFooter } from "../generic/PageFooter.js"
import { EmptyState } from "../generic/EmptyState.js"
import { PageLayout } from "../layout/PageLayout.js"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar, useViewNavigation } from "../../context/index.js"

interface McpState {
	servers: McpServer[]
	selectedIndex: number
	showingDetails: boolean
	selectedServer: McpServer | null
}

export const McpView: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const { goBack } = useViewNavigation()
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

	const handleBackToList = () => {
		setMcpState((prev) => ({
			...prev,
			showingDetails: false,
			selectedServer: null,
		}))
	}

	// Use the new keyboard navigation hook
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			t: () => {
				if (mcpState.selectedServer) {
					handleToggleServer(mcpState.selectedServer.name, mcpState.selectedServer.disabled || false)
				}
			},
			r: () => {
				if (mcpState.selectedServer) {
					handleRestartServer(mcpState.selectedServer.name)
				}
			},
			b: () => {
				if (mcpState.showingDetails) {
					handleBackToList()
				}
			},
		},
	})

	// If showing server details
	if (mcpState.showingDetails && mcpState.selectedServer) {
		const header = <PageHeader title="MCP Server" subtitle={mcpState.selectedServer.name} icon="🔌" />

		const footer = (
			<PageFooter
				actions={[
					{ key: "t", label: "to toggle" },
					{ key: "r", label: "to restart", color: "yellow" },
					{ key: "b", label: "to go back" },
				]}
			/>
		)

		const content = (
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
		)

		return (
			<PageLayout header={header} footer={footer}>
				{content}
			</PageLayout>
		)
	}

	// Main server list view
	const header = <PageHeader title="MCP Servers" badge={`${mcpState.servers.length}`} icon="🔌" />

	const footer = <PageFooter actions={[{ key: "Enter", label: "to view details" }]} />

	// Handle empty state
	if (mcpState.servers.length === 0) {
		return (
			<PageLayout header={header} footer={footer}>
				<EmptyState
					icon="🔌"
					title="No MCP servers configured"
					description="Configure MCP servers in settings to extend functionality"
				/>
			</PageLayout>
		)
	}

	const serverItems = mcpState.servers.map((server) => ({
		label: `${server.name} ${server.disabled ? "(disabled)" : "(enabled)"}`,
		value: server.name,
	}))

	const content = (
		<Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
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
		</Box>
	)

	return (
		<PageLayout header={header} footer={footer}>
			{content}
		</PageLayout>
	)
}
