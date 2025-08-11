// kilocode_change: file added
import {
	type ProviderSettings,
	openRouterProviderSortSchema,
	openRouterProviderDataCollectionSchema,
} from "@roo-code/types"

//import { useAppTranslation } from "@src/i18n/TranslationContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui"

interface Props {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: <K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => void
}

export const OpenRouterProviderSettings = ({ apiConfiguration, setApiConfigurationField }: Props) => {
	//const { t } = useAppTranslation()

	return (
		<div className="flex flex-col gap-1">
			<div className="flex justify-between items-center">
				<label className="block font-medium mb-1">Provider Routing</label>
			</div>
			<Select
				value={apiConfiguration.openRouterProviderSort ?? "default"}
				onValueChange={(value) =>
					setApiConfigurationField(
						"openRouterProviderSort",
						openRouterProviderSortSchema.safeParse(value).data,
					)
				}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="default">Default provider sorting</SelectItem>
					<SelectItem value={openRouterProviderSortSchema.Values.price}>
						Prefer providers with lower price
					</SelectItem>
					<SelectItem value={openRouterProviderSortSchema.Values.throughput}>
						Prefer providers with higher throughput
					</SelectItem>
					<SelectItem value={openRouterProviderSortSchema.Values.latency}>
						Prefer providers with lower latency
					</SelectItem>
				</SelectContent>
			</Select>
			<Select
				value={apiConfiguration.openRouterProviderDataCollection ?? "default"}
				onValueChange={(value) =>
					setApiConfigurationField(
						"openRouterProviderDataCollection",
						openRouterProviderDataCollectionSchema.safeParse(value).data,
					)
				}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="default">No data policy set</SelectItem>
					<SelectItem value={openRouterProviderDataCollectionSchema.Values.allow}>
						Allow provider data collection
					</SelectItem>
					<SelectItem value={openRouterProviderDataCollectionSchema.Values.deny}>
						Deny provider data collection
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
