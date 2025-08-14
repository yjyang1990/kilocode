import { openRouterDefaultModelId } from "@roo-code/types"
import { openRouterModelsResponseSchema } from "../fetchers/openrouter"
import { getKiloBaseUriFromToken } from "../../../shared/kilocode/token"
import { TelemetryService } from "@roo-code/telemetry"
import NodeCache from "node-cache"

const cache = new NodeCache({ stdTTL: 60, checkperiod: 60 })

export async function getKilocodeDefaultModel(kilocodeToken: string): Promise<string> {
	const baseUrl = getKiloBaseUriFromToken(kilocodeToken)
	const cachedDefaultModel = cache.get<string>(baseUrl)
	if (cachedDefaultModel) {
		return cachedDefaultModel
	}
	try {
		const response = await fetch(`${baseUrl}/api/openrouter/models`)
		if (!response.ok) {
			throw new Error(`Fetching default model failed: ${response.status}`)
		}
		const freshDefaultModel = (await openRouterModelsResponseSchema.parseAsync(await response.json())).defaultModel
		if (!freshDefaultModel) {
			throw new Error("Default model was empty")
		}
		console.info(`Fetched default model from ${baseUrl}: ${freshDefaultModel}`)
		cache.set(baseUrl, freshDefaultModel)
		return freshDefaultModel
	} catch (err) {
		TelemetryService.instance.captureException(err, { context: "getKilocodeDefaultModel" })
		return openRouterDefaultModelId
	}
}
