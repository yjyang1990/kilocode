/**
 * Field labels for provider configuration fields
 * Maps field names to user-friendly display labels
 */
export const FIELD_LABELS: Record<string, string> = {
	// Kilocode fields
	kilocodeToken: "Kilo Code Token",
	kilocodeOrganizationId: "Organization ID",
	kilocodeModel: "Model",
	// Anthropic fields
	apiKey: "API Key",
	apiModelId: "Model",
	anthropicBaseUrl: "Base URL",
	// OpenRouter fields
	openRouterApiKey: "API Key",
	openRouterModelId: "Model",
	openRouterBaseUrl: "Base URL",
	// OpenAI fields
	openAiNativeApiKey: "API Key",
	openAiNativeBaseUrl: "Base URL",
}

/**
 * Field placeholders for provider configuration fields
 * Maps field names to placeholder text for input fields
 */
export const FIELD_PLACEHOLDERS: Record<string, string> = {
	kilocodeToken: "Enter your Kilo Code token...",
	kilocodeOrganizationId: "Enter organization ID (or leave empty for personal)...",
	kilocodeModel: "Enter model name...",
	apiKey: "Enter API key...",
	apiModelId: "Enter model name...",
	anthropicBaseUrl: "Enter base URL (or leave empty for default)...",
	openRouterApiKey: "Enter OpenRouter API key...",
	openRouterModelId: "Enter model name...",
	openRouterBaseUrl: "Enter base URL (or leave empty for default)...",
	openAiNativeApiKey: "Enter OpenAI API key...",
	openAiNativeBaseUrl: "Enter base URL (or leave empty for default)...",
}

/**
 * Field types for provider configuration fields
 * Maps field names to their input types
 */
export const FIELD_TYPES: Record<string, "text" | "password" | "boolean"> = {
	// Password fields (sensitive data)
	kilocodeToken: "password",
	apiKey: "password",
	openRouterApiKey: "password",
	openAiNativeApiKey: "password",
	// Text fields
	kilocodeOrganizationId: "text",
	kilocodeModel: "text",
	apiModelId: "text",
	anthropicBaseUrl: "text",
	openRouterModelId: "text",
	openRouterBaseUrl: "text",
	openAiNativeBaseUrl: "text",
}

/**
 * Get field display information
 * @param field - Field name
 * @returns Object with label, placeholder, and type
 */
export const getFieldInfo = (field: string) => {
	return {
		label: FIELD_LABELS[field] || field,
		placeholder: FIELD_PLACEHOLDERS[field] || `Enter ${field}...`,
		type: FIELD_TYPES[field] || "text",
	}
}

/**
 * Check if a field is a sensitive field (password/token)
 * @param field - Field name
 * @returns True if field contains sensitive data
 */
export const isSensitiveField = (field: string): boolean => {
	return (
		field.toLowerCase().includes("key") ||
		field.toLowerCase().includes("token") ||
		FIELD_TYPES[field] === "password"
	)
}

/**
 * Check if a field is optional (can be empty)
 * @param field - Field name
 * @returns True if field is optional
 */
export const isOptionalField = (field: string): boolean => {
	return field.includes("BaseUrl") || field === "kilocodeOrganizationId"
}
