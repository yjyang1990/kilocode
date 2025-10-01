import { useState, useEffect, useCallback, useMemo } from "react"
import { useCliContext } from "../CliContext.js"
import { useExtensionState } from "./useExtensionState.js"
import { useExtensionMessage } from "./useExtensionMessage.js"
import { logs } from "../../../services/logs.js"
import type { RouterModels, ModelRecord, ProviderName } from "../../../types/messages.js"
import type { RouterName } from "../../../constants/providers/models.js"
import { getRouterNameForProvider } from "../../../constants/index.js"

export interface UseRouterModelsOptions {
	provider?: ProviderName
	routerName?: RouterName
	autoLoad?: boolean
}

export interface UseRouterModelsReturn {
	// Data
	routerModels: RouterModels | null
	availableModels: ModelRecord

	// Loading states
	isLoading: boolean
	isLoadingModels: boolean
	hasInitialLoad: boolean

	// Error states
	error: string | null
	modelLoadingError: string | null

	// Actions
	requestModels: () => Promise<void>
	clearError: () => void

	// Debug info
	debugInfo: {
		hasExtensionState: boolean
		hasCliContextModels: boolean
		hasExtensionStateModels: boolean
		routerModelsKeys: string[]
		availableModelsCount: number
		dataSource: "cli-context" | "extension-state" | "none"
		provider: ProviderName | undefined
		routerName: RouterName | null
	}
}

/**
 * Custom hook to manage router models state with proper loading states and fallback logic
 * Solves the race condition between CLI context and extension state router models
 */
export const useRouterModels = (options: UseRouterModelsOptions = {}): UseRouterModelsReturn => {
	const { provider, routerName: providedRouterName, autoLoad = true } = options

	// Get CLI context state
	const { state } = useCliContext()
	const extensionState = useExtensionState()
	const { requestRouterModels } = useExtensionMessage()

	// Local state for tracking loading and errors
	const [hasInitialLoad, setHasInitialLoad] = useState(false)
	const [localError, setLocalError] = useState<string | null>(null)
	const [isInitializing, setIsInitializing] = useState(true)

	// Determine router name
	const routerName = useMemo(() => {
		if (providedRouterName) return providedRouterName
		if (provider) return getRouterNameForProvider(provider)
		return null
	}, [providedRouterName, provider])

	// Get router models from multiple sources with fallback logic
	const routerModels = useMemo((): RouterModels | null => {
		// Priority 1: CLI context router models (most up-to-date)
		if (state.routerModels && Object.keys(state.routerModels).length > 0) {
			logs.debug("Using router models from CLI context", "useRouterModels", {
				keys: Object.keys(state.routerModels),
				provider,
				routerName,
			})
			return state.routerModels
		}

		// Priority 2: Extension state router models (fallback)
		if (extensionState?.routerModels && Object.keys(extensionState.routerModels).length > 0) {
			logs.debug("Using router models from extension state", "useRouterModels", {
				keys: Object.keys(extensionState.routerModels),
				provider,
				routerName,
			})
			return extensionState.routerModels
		}

		logs.debug("No router models available from any source", "useRouterModels", {
			hasCliContextModels: !!state.routerModels,
			hasExtensionStateModels: !!extensionState?.routerModels,
			provider,
			routerName,
		})
		return null
	}, [state.routerModels, extensionState?.routerModels, provider, routerName])

	// Get available models for the specific router
	const availableModels = useMemo((): ModelRecord => {
		if (!routerName || !routerModels) {
			return {}
		}

		const models = routerModels[routerName] || {}
		logs.debug("Extracted available models", "useRouterModels", {
			routerName,
			modelCount: Object.keys(models).length,
			modelKeys: Object.keys(models).slice(0, 5), // Log first 5 model keys
			provider,
		})

		return models
	}, [routerModels, routerName, provider])

	// Loading states
	const isLoadingModels = state.isLoadingModels
	// Show loading when:
	// 1. State is loading
	// 2. Models are being loaded and we haven't completed initial load
	// 3. We're initializing and don't have models yet
	const isLoading =
		state.isLoading || isLoadingModels || (isInitializing && Object.keys(availableModels).length === 0)

	// Error states
	const error = localError || state.error
	const modelLoadingError = state.modelLoadingError

	// Request models function with error handling
	const requestModels = useCallback(async () => {
		if (!routerName) {
			const errorMsg = `Cannot request models: no router name available for provider ${provider}`
			logs.warn(errorMsg, "useRouterModels")
			setLocalError(errorMsg)
			return
		}

		setLocalError(null)

		try {
			logs.debug("Requesting router models", "useRouterModels", {
				provider,
				routerName,
				hasExtensionState: !!extensionState,
			})

			await requestRouterModels()
			setHasInitialLoad(true)

			logs.debug("Router models request completed", "useRouterModels", {
				provider,
				routerName,
			})
		} catch (err) {
			const errorMsg = `Failed to request router models: ${err instanceof Error ? err.message : String(err)}`
			logs.error(errorMsg, "useRouterModels", { error: err, provider, routerName })
			setLocalError(errorMsg)
		}
	}, [routerName, provider, extensionState, requestRouterModels])

	// Clear error function
	const clearError = useCallback(() => {
		setLocalError(null)
	}, [])

	// Auto-load models when component mounts
	useEffect(() => {
		if (!autoLoad || !routerName || !extensionState) {
			setIsInitializing(false)
			return
		}

		// Only auto-load if we don't have models yet
		if (!routerModels || Object.keys(availableModels).length === 0) {
			logs.debug("Auto-loading router models", "useRouterModels", {
				provider,
				routerName,
				hasRouterModels: !!routerModels,
				availableModelsCount: Object.keys(availableModels).length,
			})

			requestModels().finally(() => {
				setIsInitializing(false)
			})
		} else {
			// We already have models, mark as initially loaded
			setHasInitialLoad(true)
			setIsInitializing(false)
			logs.debug("Router models already available, skipping auto-load", "useRouterModels", {
				provider,
				routerName,
				availableModelsCount: Object.keys(availableModels).length,
			})
		}
	}, [autoLoad, routerName, extensionState, routerModels, availableModels, requestModels, provider])

	// Debug info for troubleshooting
	const debugInfo = useMemo(() => {
		const hasCliContextModels = !!(state.routerModels && Object.keys(state.routerModels).length > 0)
		const hasExtensionStateModels = !!(
			extensionState?.routerModels && Object.keys(extensionState.routerModels).length > 0
		)

		let dataSource: "cli-context" | "extension-state" | "none" = "none"
		if (hasCliContextModels) {
			dataSource = "cli-context"
		} else if (hasExtensionStateModels) {
			dataSource = "extension-state"
		}

		return {
			hasExtensionState: !!extensionState,
			hasCliContextModels,
			hasExtensionStateModels,
			routerModelsKeys: routerModels ? Object.keys(routerModels) : [],
			availableModelsCount: Object.keys(availableModels).length,
			dataSource,
			provider,
			routerName,
		}
	}, [state.routerModels, extensionState, routerModels, availableModels, provider, routerName])

	// Log debug info when it changes
	useEffect(() => {
		logs.debug("useRouterModels debug info updated", "useRouterModels", debugInfo)
	}, [debugInfo])

	return {
		// Data
		routerModels,
		availableModels,

		// Loading states
		isLoading,
		isLoadingModels,
		hasInitialLoad,

		// Error states
		error,
		modelLoadingError,

		// Actions
		requestModels,
		clearError,

		// Debug info
		debugInfo,
	}
}
