import type { ProviderName } from "../types/messages.js"

export interface CLIConfig {
	version: "1.0.0"
	mode: string
	telemetry: boolean
	provider: string
	providers: ProviderConfig[]
}

export interface ProviderConfig {
	id: string
	provider: ProviderName
	// Provider-specific fields
	[key: string]: any
}

// Type guards
export function isValidConfig(config: unknown): config is CLIConfig {
	return (
		typeof config === "object" &&
		config !== null &&
		"version" in config &&
		"provider" in config &&
		"providers" in config
	)
}

export function isProviderConfig(provider: unknown): provider is ProviderConfig {
	return typeof provider === "object" && provider !== null && "id" in provider && "provider" in provider
}
