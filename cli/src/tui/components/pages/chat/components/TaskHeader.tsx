import React, { useState } from "react"
import { Box, Text } from "ink"
import type { ClineMessage } from "../../../../../types/messages.js"
import { formatCost, formatTokens, formatTimestamp, truncateText } from "../utils/messageFormatters.js"
import { MessageIcons, BoxChars } from "../utils/messageIcons.js"
import { TodoDisplay } from "./TodoDisplay.js"

interface TaskHeaderProps {
	task: ClineMessage
	tokensIn?: number
	tokensOut?: number
	totalCost?: number
	contextTokens?: number
	todos?: any[]
	mode?: string
	isStreaming?: boolean
	asPageHeader?: boolean
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
	task,
	tokensIn = 0,
	tokensOut = 0,
	totalCost = 0,
	contextTokens = 0,
	todos,
	mode = "code",
	isStreaming = false,
	asPageHeader = false,
}) => {
	const [isExpanded, setIsExpanded] = useState(true)

	const handleToggleExpand = () => {
		setIsExpanded(!isExpanded)
	}

	const hasMetrics = tokensIn > 0 || tokensOut > 0 || totalCost > 0

	// When used as page header, use single border and match PageHeader styling
	const headerBorderStyle = asPageHeader ? "single" : "double"
	const containerMargin = asPageHeader ? 0 : 1

	return (
		<Box flexDirection="column" marginBottom={containerMargin} flexShrink={0}>
			{/* Task Header */}
			<Box borderStyle={headerBorderStyle} borderColor="blue" paddingX={1} flexShrink={0}>
				<Box flexDirection="row" justifyContent="space-between" alignItems="center">
					<Box flexDirection="row" alignItems="center">
						{!asPageHeader && (
							<Box marginRight={1}>
								<Text>{isExpanded ? "▼" : "▶"}</Text>
							</Box>
						)}
						<Text color="blue" bold>
							Task
						</Text>
						<Box marginLeft={1}>
							<Text color="gray">({mode} mode)</Text>
						</Box>
					</Box>

					<Box flexDirection="row" alignItems="center">
						{isStreaming && (
							<Box marginRight={2}>
								<Text color="yellow">Thinking...</Text>
							</Box>
						)}
						<Text color="gray" dimColor>
							{formatTimestamp(task.ts)}
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Task Content - only show when not used as page header or when expanded */}
			{(!asPageHeader || isExpanded) && (
				<>
					<Box borderStyle="single" borderColor="blue" paddingX={1} marginTop={0} flexShrink={0}>
						<Box flexDirection="column">
							{/* Task text */}
							<Box marginBottom={1}>
								<Text color="white">
									{isExpanded ? task.text : truncateText(task.text || "No task description", 100)}
								</Text>
							</Box>

							{/* Task images */}
							{task.images && task.images.length > 0 && (
								<Box marginBottom={1}>
									<Text color="gray">{task.images.length} image(s) attached</Text>
								</Box>
							)}

							{/* Metrics row */}
							{hasMetrics && (
								<Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
									<Box flexDirection="row">
										{tokensIn > 0 && (
											<Box marginRight={2}>
												<Text color="gray">↑ {formatTokens(tokensIn)}</Text>
											</Box>
										)}
										{tokensOut > 0 && (
											<Box marginRight={2}>
												<Text color="gray">↓ {formatTokens(tokensOut)}</Text>
											</Box>
										)}
										{contextTokens > 0 && (
											<Box marginRight={2}>
												<Text color="gray">📄 {formatTokens(contextTokens)}</Text>
											</Box>
										)}
									</Box>

									{totalCost > 0 && <Text color="green">{formatCost(totalCost)}</Text>}
								</Box>
							)}

							{/* Expand/Collapse hint - only show when not used as page header */}
							{!asPageHeader && (
								<Box justifyContent="center">
									<Text color="gray" dimColor>
										Press Space to {isExpanded ? "collapse" : "expand"}
									</Text>
								</Box>
							)}
						</Box>
					</Box>

					{/* Todo List */}
					{todos && todos.length > 0 && (
						<Box marginTop={1}>
							<TodoDisplay todos={todos} isExpanded={isExpanded} maxItems={3} />
						</Box>
					)}
				</>
			)}
		</Box>
	)
}
