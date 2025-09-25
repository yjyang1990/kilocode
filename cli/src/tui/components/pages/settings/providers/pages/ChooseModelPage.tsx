import React, { useState, useEffect } from "react"
import { Box, Text, useInput } from "ink"
import { PageHeader } from "../../../../generic/PageHeader.js"
import { PageLayout } from "../../../../layout/PageLayout.js"
import { SettingsLayout } from "../../common/SettingsLayout.js"
import { SectionHeader } from "../../common/SectionHeader.js"
import { Section } from "../../common/Section.js"
import { ModelPicker } from "../../../../common/ModelPicker.js"
import { useExtensionState, useExtensionMessage, useSidebar, useRouterModels } from "../../../../../context/index.js"
import { useRouter, useQuery } from "../../../../../router/index.js"
import { getModelFieldForProvider } from "../../../../../../constants/index.js"
import { getProviderDefaultModel } from "../../../../../../constants/providers/settings.js"
import { logService } from "../../../../../../services/LogService.js"
import type { ProviderName } from "../../../../../../types/messages.js"

export const ChooseModelPage: React.FC = () => {
	logService.debug("Component starting to render", "ChooseModelPage")

	try {
		const extensionState = useExtensionState()
		logService.debug("Extension state loaded", "ChooseModelPage", { hasState: !!extensionState })

		const { sendMessage, requestRouterModels } = useExtensionMessage()
		logService.debug("Extension message hooks loaded", "ChooseModelPage", {
			hasSendMessage: !!sendMessage,
			hasRequestRouterModels: !!requestRouterModels,
		})

		const { visible: sidebarVisible } = useSidebar()
		logService.debug("Sidebar hook loaded", "ChooseModelPage", { sidebarVisible })

		const router = useRouter()
		const query = useQuery()
		logService.debug("Router loaded", "ChooseModelPage", {
			hasRouter: !!router,
			currentPath: router?.currentPath,
			query,
		})

		logService.debug("All hooks initialized successfully", "ChooseModelPage")

		const apiConfig = extensionState?.apiConfiguration || {}
		const currentApiConfigName = extensionState?.currentApiConfigName || "default"

		// Get provider and field from query params or current config
		const provider = (query.provider || apiConfig.apiProvider) as ProviderName
		const field = query.field || getModelFieldForProvider(provider)

		// Use the new router models hook with proper race condition handling
		const {
			availableModels,
			isLoading: hookIsLoading,
			isLoadingModels,
			hasInitialLoad,
			error: routerModelsError,
			modelLoadingError,
			requestModels,
			debugInfo,
		} = useRouterModels({
			provider,
			autoLoad: true,
		})

		const currentModelId = field ? (apiConfig as any)[field] : ""
		const [localError, setLocalError] = useState<string | null>(null)

		// Use the loading state from the hook directly - it already handles the race condition properly
		const isLoading = hookIsLoading

		// Combined error state
		const error = localError || routerModelsError || modelLoadingError

		// DEBUG LOGGING - Enhanced with new hook debug info
		logService.debug("Model selector debug info", "ChooseModelPage", {
			currentPath: router.currentPath,
			query,
			providerFromQuery: query.provider,
			fieldFromQuery: query.field,
			apiConfigProvider: apiConfig.apiProvider,
			finalProvider: provider,
			finalField: field,
			currentModelId,
			hasExtensionState: !!extensionState,
			availableModelsCount: Object.keys(availableModels).length,
			shouldShowSelector: !!(debugInfo.routerName && field),
			isLoading,
			isLoadingModels,
			error,
			// Include debug info from the hook
			hookDebugInfo: debugInfo,
		})

		const handleModelSelect = async (modelId: string) => {
			if (!field) return

			try {
				const updatedConfig = {
					...apiConfig,
					[field]: modelId,
				}

				await sendMessage({
					type: "upsertApiConfiguration",
					text: currentApiConfigName,
					apiConfiguration: updatedConfig,
				})

				router.goBack()
			} catch (error) {
				logService.error("Failed to update model", "ChooseModelPage", { error })
				setLocalError("Failed to update model")
			}
		}

		const handleCancel = () => {
			router.goBack()
		}

		// Add keyboard handling for retry when no models are available
		useInput((input, key) => {
			// Only handle input when not loading and when we have no models
			if (!isLoading && Object.keys(availableModels).length === 0) {
				if (input.toLowerCase() === "r") {
					logService.debug("Retrying model fetch", "ChooseModelPage", { provider })
					requestModels()
				} else if (key.escape) {
					router.goBack()
				}
			}
		})

		const header = <PageHeader title={`Settings - Providers - Choose Model (${provider})`} />

		if (!debugInfo.routerName || !field) {
			const content = (
				<SettingsLayout isIndexPage={false}>
					<Box flexDirection="column">
						<SectionHeader
							title="Model Selection Not Available"
							description={`The ${provider} provider does not support dynamic model selection`}
						/>
						<Section>
							<Box flexDirection="column" gap={1}>
								<Text color="yellow">
									This provider uses a fixed model or requires manual model entry.
								</Text>
								<Text color="gray" dimColor>
									Default model: {getProviderDefaultModel(provider)}
								</Text>
								<Text color="gray" dimColor>
									[Esc] Go Back
								</Text>
							</Box>
						</Section>
					</Box>
				</SettingsLayout>
			)
			return <PageLayout header={header}>{content}</PageLayout>
		}

		const content = (
			<SettingsLayout isIndexPage={false}>
				<Box flexDirection="column">
					<SectionHeader title={`Select Model for ${provider}`} description="Choose from available models" />
					<Section>
						{isLoading ? (
							<Box flexDirection="column" gap={1}>
								<Text color="yellow">Loading models...</Text>
								<Text color="gray" dimColor>
									Fetching available models from {provider}...
								</Text>
								{isLoadingModels && (
									<Text color="gray" dimColor>
										This may take a few seconds on first load
									</Text>
								)}
								<Box marginTop={1}>
									<Text color="gray" dimColor>
										[Esc] Cancel
									</Text>
								</Box>
							</Box>
						) : error ? (
							<Box flexDirection="column" gap={1}>
								<Text color="red">Error: {error}</Text>
								<Text color="gray" dimColor>
									Make sure your API credentials are configured correctly
								</Text>
								<Text color="gray" dimColor>
									[Esc] Go Back
								</Text>
							</Box>
						) : Object.keys(availableModels).length === 0 ? (
							<Box flexDirection="column" gap={1}>
								<Text color="yellow">No models available</Text>
								<Text color="gray" dimColor>
									This could mean:
								</Text>
								<Box marginLeft={2} flexDirection="column">
									<Text color="gray" dimColor>
										• API credentials are not configured
									</Text>
									<Text color="gray" dimColor>
										• The provider service is unavailable
									</Text>
									<Text color="gray" dimColor>
										• Network connection issues
									</Text>
								</Box>
								<Box marginTop={1}>
									<Text color="gray" dimColor>
										You can still enter a model name manually in the provider settings
									</Text>
								</Box>
								<Box marginTop={1}>
									<Text color="gray" dimColor>
										Data source: {debugInfo.dataSource} | Router: {debugInfo.routerName || "none"}
									</Text>
								</Box>
								<Box marginTop={1}>
									<Text color="gray" dimColor>
										[R] Retry | [Esc] Go Back
									</Text>
								</Box>
							</Box>
						) : (
							(() => {
								// Safely construct the description to avoid text rendering errors
								const modelCount = Object.keys(availableModels).length
								const modelCountText = modelCount === 1 ? "1 model" : `${modelCount} models`
								const currentText = currentModelId || "Not set"
								const descriptionText = `Current: ${currentText} | Available: ${modelCountText}`

								return (
									<ModelPicker
										models={availableModels}
										selectedModel={currentModelId}
										onModelSelect={handleModelSelect}
										onCancel={handleCancel}
										title={`Select Model for ${provider}`}
										description={descriptionText}
									/>
								)
							})()
						)}
					</Section>
				</Box>
			</SettingsLayout>
		)

		logService.debug("About to return component", "ChooseModelPage")
		return <PageLayout header={header}>{content}</PageLayout>
	} catch (error) {
		logService.error("Component error", "ChooseModelPage", { error })
		const errorMessage = error instanceof Error ? error.message : String(error)
		const errorHeader = <PageHeader title="Model Selector Error" />
		const errorContent = (
			<SettingsLayout isIndexPage={false}>
				<Box flexDirection="column" gap={1}>
					<Text color="red">Component Error: {errorMessage}</Text>
					<Text color="gray">Check console for details</Text>
					<Text color="gray">[Esc] Go Back</Text>
				</Box>
			</SettingsLayout>
		)
		return <PageLayout header={errorHeader}>{errorContent}</PageLayout>
	}
}
