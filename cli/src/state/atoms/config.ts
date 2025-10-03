import { atom } from "jotai"
import type { CLIConfig, ProviderConfig } from "../../config/types.js"
import { DEFAULT_CONFIG } from "../../config/defaults.js"
import { loadConfig, saveConfig } from "../../config/persistence.js"
import { mapConfigToExtensionState } from "../../config/mapper.js"
import { logs } from "../../services/logs.js"

// Core config atom - holds the current configuration
export const configAtom = atom<CLIConfig>(DEFAULT_CONFIG)

// Loading state atom
export const configLoadingAtom = atom<boolean>(false)

// Error state atom
export const configErrorAtom = atom<Error | null>(null)

// Derived atom for selected provider
export const providerAtom = atom((get) => {
	const config = get(configAtom)
	return config.providers.find((p) => p.id === config.provider)
})

// Derived atom for provider list
export const providersAtom = atom((get) => get(configAtom).providers)

// Derived atom for current mode
export const modeAtom = atom((get) => {
	const config = get(configAtom)
	return config.mode
})

// Action atom to load config from disk
// Accepts optional mode parameter to override the loaded config's mode
export const loadConfigAtom = atom(null, async (get, set, mode?: string) => {
	try {
		set(configLoadingAtom, true)
		set(configErrorAtom, null)

		const config = await loadConfig()

		// Override mode if provided (e.g., from CLI options)
		const finalConfig = mode ? { ...config, mode } : config
		set(configAtom, finalConfig)

		logs.info("Config loaded successfully", "ConfigAtoms", { mode: finalConfig.mode })
		return finalConfig
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error))
		set(configErrorAtom, err)
		logs.error("Failed to load config", "ConfigAtoms", { error })
		throw err
	} finally {
		set(configLoadingAtom, false)
	}
})

// Action atom to save config to disk
export const saveConfigAtom = atom(null, async (get, set, config?: CLIConfig) => {
	try {
		const configToSave = config || get(configAtom)
		await saveConfig(configToSave)

		if (config) {
			set(configAtom, config)
		}

		logs.info("Config saved successfully", "ConfigAtoms")
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error))
		set(configErrorAtom, err)
		logs.error("Failed to save config", "ConfigAtoms", { error })
		throw err
	}
})

// Action atom to update selected provider
export const selectProviderAtom = atom(null, async (get, set, providerId: string) => {
	const config = get(configAtom)
	const provider = config.providers.find((p) => p.id === providerId)

	if (!provider) {
		throw new Error(`Provider ${providerId} not found`)
	}

	const updatedConfig = {
		...config,
		provider: providerId,
	}

	set(configAtom, updatedConfig)
	await set(saveConfigAtom, updatedConfig)
})

// Action atom to add a new provider
export const addProviderAtom = atom(null, async (get, set, provider: ProviderConfig) => {
	const config = get(configAtom)

	// Check for duplicate ID
	if (config.providers.some((p) => p.id === provider.id)) {
		throw new Error(`Provider with ID ${provider.id} already exists`)
	}

	const updatedConfig = {
		...config,
		providers: [...config.providers, provider],
	}

	set(configAtom, updatedConfig)
	await set(saveConfigAtom, updatedConfig)
})

// Action atom to update a provider
export const updateProviderAtom = atom(null, async (get, set, providerId: string, updates: Partial<ProviderConfig>) => {
	const config = get(configAtom)
	const providerIndex = config.providers.findIndex((p) => p.id === providerId)

	if (providerIndex === -1) {
		throw new Error(`Provider ${providerId} not found`)
	}

	const updatedProviders = [...config.providers]
	updatedProviders[providerIndex] = {
		...updatedProviders[providerIndex],
		...updates,
	} as ProviderConfig

	const updatedConfig = {
		...config,
		providers: updatedProviders,
	}

	set(configAtom, updatedConfig)
	await set(saveConfigAtom, updatedConfig)
})

// Action atom to remove a provider
export const removeProviderAtom = atom(null, async (get, set, providerId: string) => {
	const config = get(configAtom)

	const updatedConfig = {
		...config,
		providers: config.providers.filter((p) => p.id !== providerId),
		// Update selected if we're removing the selected provider
		provider: config.provider === providerId ? config.providers[0]?.id || "" : config.provider,
	}

	set(configAtom, updatedConfig)
	await set(saveConfigAtom, updatedConfig)
})

// Action atom to update mode in config and persist
export const setModeAtom = atom(null, async (get, set, mode: string) => {
	const config = get(configAtom)
	const updatedConfig = {
		...config,
		mode,
	}

	set(configAtom, updatedConfig)
	await set(saveConfigAtom, updatedConfig)

	logs.info(`Mode updated to: ${mode}`, "ConfigAtoms")

	// Import from config-sync to avoid circular dependency
	const { syncConfigToExtensionEffectAtom } = await import("./config-sync.js")

	// Trigger sync to extension after mode change
	await set(syncConfigToExtensionEffectAtom)
})

// Atom to get mapped extension state
export const mappedExtensionStateAtom = atom((get) => {
	const config = get(configAtom)
	return mapConfigToExtensionState(config)
})
