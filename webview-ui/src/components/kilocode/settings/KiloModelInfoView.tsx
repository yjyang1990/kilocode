import type { ModelInfo } from "@roo-code/types"

import { formatPrice } from "@src/utils/formatPrice"
import { useAppTranslation } from "@src/i18n/TranslationContext"

import { ModelDescriptionMarkdown } from "../../settings/ModelDescriptionMarkdown"
import { ModelInfoSupportsItem } from "@/components/settings/ModelInfoView"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui"

const PricingTable = ({ providers }: { providers: (ModelInfo & { label: string })[] }) => {
	const thClass = "text-left px-3 py-2 font-medium text-vscode-foreground whitespace-nowrap"
	const tdClass = "px-3 py-2 text-vscode-descriptionForeground whitespace-nowrap"
	return (
		<div className="overflow-x-auto border border-vscode-widget-border rounded-md">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-vscode-widget-border bg-vscode-editor-background">
						<th className={thClass}>Provider</th>
						<th className={thClass}>CW</th>
						<th className={thClass}>MO</th>
						<th className={thClass}>I$/M</th>
						<th className={thClass}>O$/M</th>
						<th className={thClass}>CR$/M</th>
						<th className={thClass}>CW$/M</th>
					</tr>
				</thead>
				<tbody>
					{providers.map((item, index) => (
						<tr
							key={item.label}
							className={`border-b border-vscode-widget-border last:border-b-0 ${index % 2 === 0 ? "bg-vscode-editor-background" : "bg-vscode-sideBar-background"} hover:bg-vscode-list-hoverBackground`}>
							<td className="px-3 py-2 text-vscode-foreground whitespace-nowrap">{item.label}</td>
							<td className={tdClass}>{item.contextWindow.toLocaleString()}</td>
							<td className={tdClass}>{item.maxTokens?.toLocaleString() ?? 0}</td>
							<td className={tdClass}>{formatPrice(item.inputPrice ?? 0)}</td>
							<td className={tdClass}>{formatPrice(item.outputPrice ?? 0)}</td>
							<td className={tdClass}>{item.cacheReadsPrice && formatPrice(item.cacheReadsPrice)}</td>
							<td className={tdClass}>{item.cacheWritesPrice && formatPrice(item.cacheWritesPrice)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export const KiloModelInfoView = ({
	model,
	providers,
	isPricingExpanded,
	setIsPricingExpanded,
}: {
	model: ModelInfo
	providers: (ModelInfo & { label: string })[]
	isPricingExpanded: boolean
	setIsPricingExpanded: (isPricingExpanded: boolean) => void
}) => {
	const { t } = useAppTranslation()
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

	return (
		<>
			{model.description && (
				<ModelDescriptionMarkdown
					key="description"
					markdown={model.description}
					isExpanded={isDescriptionExpanded}
					setIsExpanded={setIsDescriptionExpanded}
				/>
			)}
			<div className="text-sm text-vscode-descriptionForeground">
				<ModelInfoSupportsItem
					isSupported={model.supportsImages ?? false}
					supportsLabel={t("settings:modelInfo.supportsImages")}
					doesNotSupportLabel={t("settings:modelInfo.noImages")}
				/>
				<ModelInfoSupportsItem
					isSupported={model.supportsPromptCache}
					supportsLabel={t("settings:modelInfo.supportsPromptCache")}
					doesNotSupportLabel={t("settings:modelInfo.noPromptCache")}
				/>
				<div>
					<span className="font-medium">Context window:</span> {model.contextWindow.toLocaleString()}
				</div>
				<div>
					<span className="font-medium">{t("settings:modelInfo.maxOutput")}:</span>{" "}
					{model.maxTokens?.toLocaleString() ?? 0}
				</div>
			</div>
			<Collapsible open={isPricingExpanded} onOpenChange={setIsPricingExpanded}>
				<CollapsibleTrigger className="flex items-center gap-1 w-full cursor-pointer hover:opacity-80 mb-2">
					<span className={`codicon codicon-chevron-${isPricingExpanded ? "down" : "right"}`}></span>
					<span className="font-medium">Pricing details</span>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-3">
					<PricingTable providers={providers} />
				</CollapsibleContent>
			</Collapsible>
		</>
	)
}
