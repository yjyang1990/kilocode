// kilocode_change: file added
import {
	type ProviderSettings,
	openRouterProviderSortSchema,
	openRouterProviderDataCollectionSchema,
} from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui"

interface Props {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: <K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => void
}

export const OpenRouterProviderSettings = ({ apiConfiguration, setApiConfigurationField }: Props) => {
	const { t } = useAppTranslation()

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
					<SelectItem value="default">
						{t("kilocode:settings.provider.providerRouting.sorting.default")}
					</SelectItem>
					<SelectItem value={openRouterProviderSortSchema.Values.price}>
						{t("kilocode:settings.provider.providerRouting.sorting.price")}
					</SelectItem>
					<SelectItem value={openRouterProviderSortSchema.Values.throughput}>
						{t("kilocode:settings.provider.providerRouting.sorting.throughput")}
					</SelectItem>
					<SelectItem value={openRouterProviderSortSchema.Values.latency}>
						{t("kilocode:settings.provider.providerRouting.sorting.latency")}
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
					<SelectItem value="default">
						{t("kilocode:settings.provider.providerRouting.dataCollection.default")}
					</SelectItem>
					<SelectItem value={openRouterProviderDataCollectionSchema.Values.allow}>
						{t("kilocode:settings.provider.providerRouting.dataCollection.allow")}
					</SelectItem>
					<SelectItem value={openRouterProviderDataCollectionSchema.Values.deny}>
						{t("kilocode:settings.provider.providerRouting.dataCollection.deny")}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
