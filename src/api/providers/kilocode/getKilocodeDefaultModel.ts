import { openRouterDefaultModelId } from "@roo-code/types"
import { getKiloBaseUriFromToken } from "../../../shared/kilocode/token"
import { TelemetryService } from "@roo-code/telemetry"
import { z } from "zod"

const cache = new Map<string, Promise<string>>()

const defaultsSchema = z.object({
	defaultModel: z.string().nullish(),
})

async function fetchKilocodeDefaultModel(kilocodeToken: string): Promise<string> {
	const url = `${getKiloBaseUriFromToken(kilocodeToken)}/api/defaults`
	const response = await fetch(
		url,
		kilocodeToken
			? {
					headers: {
						Authorization: `Bearer ${kilocodeToken}`,
					},
				}
			: undefined,
	)
	if (!response.ok) {
		throw new Error(`Fetching default model from ${url} failed: ${response.status}`)
	}
	const defaultModel = (await defaultsSchema.parseAsync(await response.json())).defaultModel
	if (!defaultModel) {
		throw new Error(`Default model from ${url} was empty`)
	}
	console.info(`Fetched default model from ${url}: ${defaultModel}`)
	return defaultModel
}

export async function getKilocodeDefaultModel(kilocodeToken: string): Promise<string> {
	try {
		let defaultModelPromise = cache.get(kilocodeToken)
		if (!defaultModelPromise) {
			defaultModelPromise = fetchKilocodeDefaultModel(kilocodeToken)
			cache.set(kilocodeToken, defaultModelPromise)
		}
		return await defaultModelPromise
	} catch (err) {
		console.error("Failed to get default model", err)
		cache.delete(kilocodeToken)
		TelemetryService.instance.captureException(err, { context: "getKilocodeDefaultModel" })
		return openRouterDefaultModelId
	}
}
