import React, { useState, useEffect } from "react"
import { Box, Text } from "ink"
import { PageHeader } from "../../../../generic/PageHeader.js"
import { PageLayout } from "../../../../layout/PageLayout.js"
import { SettingsLayout } from "../../common/SettingsLayout.js"
import { SectionHeader } from "../../common/SectionHeader.js"
import { Section } from "../../common/Section.js"
import { ModelPicker } from "../../../../common/ModelPicker.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../../context/index.js"
import { useRouter, useQuery } from "../../../../../router/index.js"
import { getRouterNameForProvider, getModelFieldForProvider } from "../../../../../../constants/index.js"
import { getProviderDefaultModel } from "../../../../../../constants/providers/settings.js"
import { logService } from "../../../../../../services/LogService.js"
import type { ProviderName, RouterModels, ModelRecord } from "../../../../../../types/messages.js"

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

		const [isLoading, setIsLoading] = useState(false)
		const [error, setError] = useState<string | null>(null)

		logService.debug("All hooks initialized successfully", "ChooseModelPage")

		const apiConfig = extensionState?.apiConfiguration || {}
		const currentApiConfigName = extensionState?.currentApiConfigName || "default"
		const routerModels: RouterModels = extensionState?.routerModels || ({} as RouterModels)

		// Get provider and field from query params or current config
		const provider = (query.provider || apiConfig.apiProvider) as ProviderName
		const field = query.field || getModelFieldForProvider(provider)
		const routerName = getRouterNameForProvider(provider)

		const currentModelId = field ? (apiConfig as any)[field] : ""
		const availableModels: ModelRecord = routerName && routerModels[routerName] ? routerModels[routerName] : {}

		// DEBUG LOGGING
		logService.debug("Model selector debug info", "ChooseModelPage", {
			currentPath: router.currentPath,
			query,
			providerFromQuery: query.provider,
			fieldFromQuery: query.field,
			apiConfigProvider: apiConfig.apiProvider,
			finalProvider: provider,
			finalField: field,
			routerName,
			currentModelId,
			hasExtensionState: !!extensionState,
			routerModelsKeys: Object.keys(routerModels),
			availableModelsCount: Object.keys(availableModels).length,
			shouldShowSelector: !!(routerName && field),
		})

		// Load models when component mounts
		useEffect(() => {
			const loadModels = async () => {
				if (!routerName) return

				setIsLoading(true)
				setError(null)

				try {
					await requestRouterModels()
				} catch (err) {
					setError("Failed to load models")
					logService.error("Failed to load models", "ChooseModelPage", { error: err })
				} finally {
					setIsLoading(false)
				}
			}

			loadModels()
		}, [routerName, requestRouterModels])

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
				setError("Failed to update model")
			}
		}

		const handleCancel = () => {
			router.goBack()
		}

		const header = <PageHeader title={`Settings - Providers - Choose Model (${provider})`} />

		if (!routerName || !field) {
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
									Make sure your API credentials are configured correctly
								</Text>
								<Text color="gray" dimColor>
									You can still enter a model name manually in the provider settings
								</Text>
								<Text color="gray" dimColor>
									[Esc] Go Back
								</Text>
							</Box>
						) : (
							<ModelPicker
								models={availableModels}
								selectedModel={currentModelId}
								onModelSelect={handleModelSelect}
								onCancel={handleCancel}
								title={`Select Model for ${provider}`}
								description={`Current: ${currentModelId || "Not set"} | Available: ${Object.keys(availableModels).length} models`}
							/>
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
					<Text color="red">❌ Component Error: {errorMessage}</Text>
					<Text color="gray">Check console for details</Text>
					<Text color="gray">[Esc] Go Back</Text>
				</Box>
			</SettingsLayout>
		)
		return <PageLayout header={errorHeader}>{errorContent}</PageLayout>
	}
}
