import { VSCodeButtonLink } from "../common/VSCodeButtonLink"
import { telemetryClient } from "@/utils/TelemetryClient"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { ProviderSettings, TelemetryEventName } from "@roo-code/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Trans } from "react-i18next"

const InfoView = ({ children }: { children: React.ReactNode }) => {
	return <div className="bg-vscode-editor-background border p-3 shadow-sm text-center">{children}</div>
}

export const OpenRouterMarkupInfoView = ({
	setApiConfigurationField,
}: {
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}) => {
	return (
		<InfoView>
			<div className="text-vscode-descriptionForeground">
				<Trans i18nKey="kilocode:pricing.openRouterMarkup" />
			</div>
			<VSCodeButton
				appearance="primary"
				className="mt-3 w-full"
				onClick={() => {
					setApiConfigurationField("apiProvider", "kilocode")
					telemetryClient.capture(TelemetryEventName.SWITCH_TO_KILO_CODE_CLICKED)
				}}>
				<Trans i18nKey="kilocode:pricing.switchToKiloCode" />
			</VSCodeButton>
		</InfoView>
	)
}

export const FreeModelsInfoView = ({ origin, modelId }: { origin: "chat" | "settings"; modelId?: string }) => {
	const { t } = useAppTranslation()
	return (
		<InfoView>
			<div className="text-vscode-descriptionForeground">{t("kilocode:pricing.freeModelsDescription")}</div>
			<FreeModelsLink className="mt-3 w-full" origin={origin} modelId={modelId} />
		</InfoView>
	)
}

export const FreeModelsLink = ({
	className,
	origin,
	modelId,
}: {
	className: string
	origin: "chat" | "settings"
	modelId?: string
}) => {
	const { t } = useAppTranslation()
	return (
		<VSCodeButtonLink
			href="https://kilo.love/continueforfree"
			appearance="primary"
			className={className}
			onClick={() => {
				telemetryClient.capture(TelemetryEventName.FREE_MODELS_LINK_CLICKED, {
					modelId,
					origin,
				})
			}}>
			{t("kilocode:pricing.freeModelsLink")}
		</VSCodeButtonLink>
	)
}
