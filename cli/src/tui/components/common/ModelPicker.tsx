import React, { useState, useEffect, useMemo } from "react"
import { Box, Text } from "ink"
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation.js"
import { useSidebar } from "../../context/index.js"
import { UI_CONSTANTS } from "../../../constants/index.js"
import type { ModelRecord, ModelInfo } from "../../../constants/providers/models.js"

interface ModelPickerProps {
	models: ModelRecord
	selectedModel: string
	onModelSelect: (modelId: string) => void
	onCancel: () => void
	title?: string
	description?: string
}

export const ModelPicker: React.FC<ModelPickerProps> = ({
	models,
	selectedModel,
	onModelSelect,
	onCancel,
	title = "Select Model",
	description = "Choose a model from the available options",
}) => {
	const { visible: sidebarVisible } = useSidebar()
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [searchTerm, setSearchTerm] = useState("")

	// Sort models with preferred ones first, then alphabetically
	const sortedModelIds = useMemo(() => {
		const modelEntries = Object.entries(models)

		// Separate preferred and non-preferred models
		const preferred = modelEntries
			.filter(([_, info]) => typeof info.preferredIndex === "number")
			.sort(([_, a], [__, b]) => (a.preferredIndex || 0) - (b.preferredIndex || 0))

		const nonPreferred = modelEntries
			.filter(([_, info]) => typeof info.preferredIndex !== "number")
			.sort(([a], [b]) => a.localeCompare(b))

		return [...preferred, ...nonPreferred].map(([id]) => id)
	}, [models])

	// Filter models based on search term
	const filteredModelIds = useMemo(() => {
		if (!searchTerm) return sortedModelIds
		return sortedModelIds.filter(
			(id) =>
				id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				models[id]?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				models[id]?.description?.toLowerCase().includes(searchTerm.toLowerCase()),
		)
	}, [sortedModelIds, searchTerm, models])

	// Calculate visible models for scrolling
	const visibleModels = useMemo(() => {
		const startIndex = Math.max(
			0,
			Math.min(
				selectedIndex - Math.floor(UI_CONSTANTS.VISIBLE_ITEMS / 2),
				filteredModelIds.length - UI_CONSTANTS.VISIBLE_ITEMS,
			),
		)
		const endIndex = Math.min(startIndex + UI_CONSTANTS.VISIBLE_ITEMS, filteredModelIds.length)
		return {
			models: filteredModelIds.slice(startIndex, endIndex),
			startIndex,
			endIndex,
		}
	}, [selectedIndex, filteredModelIds])

	// Find current model index when component mounts
	useEffect(() => {
		if (selectedModel) {
			const index = filteredModelIds.findIndex((id) => id === selectedModel)
			setSelectedIndex(index >= 0 ? index : 0)
		}
	}, [selectedModel, filteredModelIds])

	const handleSelect = () => {
		const modelId = filteredModelIds[selectedIndex]
		if (modelId) {
			onModelSelect(modelId)
		}
	}

	// Keyboard navigation
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			upArrow: () => {
				setSelectedIndex((prev) => Math.max(0, prev - 1))
			},
			downArrow: () => {
				setSelectedIndex((prev) => Math.min(filteredModelIds.length - 1, prev + 1))
			},
			return: handleSelect,
			escape: onCancel,
		},
	})

	if (filteredModelIds.length === 0) {
		return (
			<Box flexDirection="column" gap={1}>
				<Text bold>{title}</Text>
				<Text color="gray" dimColor>
					{description}
				</Text>
				<Text color="yellow">No models available</Text>
				<Text color="gray" dimColor>
					[Esc] Go Back
				</Text>
			</Box>
		)
	}

	return (
		<Box flexDirection="column">
			<Box flexDirection="column" marginBottom={1}>
				<Text bold>{title}</Text>
				<Text color="gray" dimColor>
					{description}
				</Text>
			</Box>

			<Box flexDirection="column" height={UI_CONSTANTS.VISIBLE_ITEMS}>
				{visibleModels.models.map((modelId, relativeIndex) => {
					const actualIndex = visibleModels.startIndex + relativeIndex
					const isSelected = actualIndex === selectedIndex
					const modelInfo = models[modelId]
					const isCurrentModel = modelId === selectedModel
					const isPreferred = typeof modelInfo?.preferredIndex === "number"

					return (
						<Box key={modelId} paddingX={1}>
							<Text color={isSelected ? "cyan" : isPreferred ? "green" : "white"}>
								{isSelected ? "❯ " : "  "}
								{modelInfo?.displayName || modelId}
								{isCurrentModel ? " (current)" : ""}
							</Text>
						</Box>
					)
				})}
			</Box>

			{/* Scroll indicators */}
			<Box justifyContent="center" marginTop={1}>
				<Text color="gray" dimColor>
					{`${selectedIndex + 1} of ${filteredModelIds.length}`}
					{visibleModels.startIndex > 0 && " ↑"}
					{visibleModels.endIndex < filteredModelIds.length && " ↓"}
				</Text>
			</Box>

			<Box justifyContent="flex-start" gap={4} marginTop={1}>
				<Text color="gray" dimColor>
					[↑/↓] Navigate
				</Text>
				<Text color="gray" dimColor>
					[Enter] Select
				</Text>
				<Text color="gray" dimColor>
					[Esc] Cancel
				</Text>
			</Box>
		</Box>
	)
}
