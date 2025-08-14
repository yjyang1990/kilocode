import { openRouterDefaultModelId } from "@roo-code/types"
import { openRouterModelsResponseSchema } from "../fetchers/openrouter"
import { getKiloBaseUriFromToken } from "../../../shared/kilocode/token"
import { TelemetryService } from "@roo-code/telemetry"

const cache = new Map<string, Promise<string>>()

async function fetchKilocodeDefaultModel(baseUrl: string): Promise<string> {
	const response = await fetch(`${baseUrl}/api/openrouter/models`)
	if (!response.ok) {
		throw new Error(`Fetching default model failed: ${response.status}`)
	}
	const defaultModel = (await openRouterModelsResponseSchema.parseAsync(await response.json())).defaultModel
	if (!defaultModel) {
		throw new Error("Default model was empty")
	}
	console.info("Fetched default model", defaultModel)
	return defaultModel
}

export async function getKilocodeDefaultModel(kilocodeToken: string): Promise<string> {
	const baseUrl = getKiloBaseUriFromToken(kilocodeToken)
	try {
		let defaultModelPromise = cache.get(baseUrl)
		if (!defaultModelPromise) {
			defaultModelPromise = fetchKilocodeDefaultModel(baseUrl)
			cache.set(baseUrl, defaultModelPromise)
		}
		return await defaultModelPromise
	} catch (err) {
		console.error("Failed to get default model", err)
		cache.delete(baseUrl)
		TelemetryService.instance.captureException(err, { context: "getKilocodeDefaultModel" })
		return openRouterDefaultModelId
	}
}
