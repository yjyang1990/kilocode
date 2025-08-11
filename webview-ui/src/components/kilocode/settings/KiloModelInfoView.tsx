import type { ModelInfo } from "@roo-code/types"

import { formatPrice } from "@src/utils/formatPrice"
import { useAppTranslation } from "@src/i18n/TranslationContext"

import { ModelDescriptionMarkdown } from "../../settings/ModelDescriptionMarkdown"
import { ModelInfoSupportsItem } from "@/components/settings/ModelInfoView"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui"

export const KiloModelInfoView = ({
	model,
	providers,
}: {
	model: ModelInfo
	providers: (ModelInfo & { label: string })[]
}) => {
	const { t } = useAppTranslation()
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
	const [isPricingExpanded, setIsPricingExpanded] = useState(false)

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
					<table>
						<tr>
							<th>Name</th>
							<th>CW</th>
							<th>MO</th>
							<th>I$/M</th>
							<th>O$/M</th>
							<th>CR$/M</th>
							<th>CW$/M</th>
						</tr>
						{providers.map((item) => (
							<tr key={item.label}>
								<td>{item.label}</td>
								<td>{item.contextWindow.toLocaleString()}</td>
								<td>{item.maxTokens?.toLocaleString() ?? 0}</td>
								<td>{formatPrice(item.inputPrice ?? 0)}</td>
								<td>{formatPrice(item.outputPrice ?? 0)}</td>
								<td>{item.cacheReadsPrice && formatPrice(item.cacheReadsPrice)}</td>
								<td>{item.cacheWritesPrice && formatPrice(item.cacheWritesPrice)}</td>
							</tr>
						))}
					</table>
				</CollapsibleContent>
			</Collapsible>
		</>
	)
}
