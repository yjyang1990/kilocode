/**
 * StatusBar component - displays project info, git branch, mode, model, and context usage
 */

import React, { useMemo } from "react"
import { Box, Text } from "ink"
import { useAtomValue } from "jotai"
import {
	cwdAtom,
	extensionModeAtom,
	apiConfigurationAtom,
	chatMessagesAtom,
	routerModelsAtom,
} from "../../state/atoms/index.js"
import { useGitInfo } from "../../state/hooks/useGitInfo.js"
import { useContextUsage } from "../../state/hooks/useContextUsage.js"
import { getContextColor, formatContextUsage } from "../../utils/context.js"
import {
	getCurrentModelId,
	getModelsByProvider,
	prettyModelName,
	type RouterModels,
} from "../../constants/providers/models.js"
import type { ProviderSettings } from "../../types/messages.js"
import path from "path"

const MAX_MODEL_NAME_LENGTH = 40

/**
 * Get the display name for the current model
 */
function getModelDisplayName(apiConfig: ProviderSettings | null, routerModels: RouterModels | null): string {
	if (!apiConfig || !apiConfig.apiProvider) return "N/A"

	try {
		// Get current model ID
		const currentModelId = getCurrentModelId({
			providerConfig: {
				provider: apiConfig.apiProvider,
				...apiConfig,
			} as any,
			routerModels,
			kilocodeDefaultModel: apiConfig.kilocodeModel || "",
		})

		// Get models for the provider
		const { models } = getModelsByProvider({
			provider: apiConfig.apiProvider,
			routerModels,
			kilocodeDefaultModel: apiConfig.kilocodeModel || "",
		})

		// Get model info
		const modelInfo = models[currentModelId]

		// Use displayName if available, otherwise use pretty name
		const displayName = modelInfo?.displayName || prettyModelName(currentModelId)

		// Limit length for display
		return displayName.length > MAX_MODEL_NAME_LENGTH
			? displayName.substring(0, MAX_MODEL_NAME_LENGTH - 3) + "..."
			: displayName
	} catch (error) {
		// Fallback to simple model ID extraction
		const modelId =
			apiConfig.apiModelId ||
			apiConfig.openAiModelId ||
			apiConfig.ollamaModelId ||
			apiConfig.kilocodeModel ||
			"Unknown"

		return modelId.length > MAX_MODEL_NAME_LENGTH
			? modelId.substring(0, MAX_MODEL_NAME_LENGTH - 3) + "..."
			: modelId
	}
}

/**
 * Get project name from workspace path
 */
function getProjectName(cwd: string | null): string {
	if (!cwd) return "N/A"
	return path.basename(cwd)
}

/**
 * StatusBar component that displays current project status
 */
export const StatusBar: React.FC = () => {
	// Get data from atoms
	const cwd = useAtomValue(cwdAtom)
	const mode = useAtomValue(extensionModeAtom)
	const apiConfig = useAtomValue(apiConfigurationAtom)
	const messages = useAtomValue(chatMessagesAtom)
	const routerModels = useAtomValue(routerModelsAtom)

	// Get git info
	const gitInfo = useGitInfo(cwd)

	// Calculate context usage
	const contextUsage = useContextUsage(messages, apiConfig)

	// Prepare display values
	const projectName = getProjectName(cwd)
	const modelName = useMemo(() => getModelDisplayName(apiConfig, routerModels), [apiConfig, routerModels])
	const contextColor = getContextColor(contextUsage.percentage)
	const contextText = formatContextUsage(contextUsage)

	// Git status color (green if clean, yellow if dirty)
	const gitStatusColor = gitInfo.isClean ? "green" : "yellow"

	return (
		<Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
			{/* Left side: Project and Git Branch */}
			<Box>
				{/* Project Name */}
				<Text color="cyan" bold>
					{projectName}
				</Text>

				{/* Git Branch */}
				{gitInfo.isRepo && gitInfo.branch ? (
					<>
						<Text color="gray" dimColor>
							{" / "}
						</Text>
						<Text color={gitStatusColor}>{gitInfo.branch}</Text>
					</>
				) : null}
			</Box>

			{/* Right side: Mode, Model, and Context */}
			<Box>
				{/* Mode */}
				<Text color="magenta" bold>
					{mode.charAt(0).toUpperCase() + mode.slice(1)}
				</Text>

				<Text color="gray" dimColor>
					{" | "}
				</Text>

				{/* Model */}
				<Text color="blue">{modelName}</Text>

				<Text color="gray" dimColor>
					{" | "}
				</Text>

				{/* Context Usage */}
				<Text color={contextColor} bold>
					{contextText}
				</Text>
			</Box>
		</Box>
	)
}
