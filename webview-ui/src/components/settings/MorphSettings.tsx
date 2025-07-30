// kilocode_change: Morph fast apply - file added

import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { ProviderSettings } from "@roo-code/types"

export const MorphSettings = ({
	apiConfiguration,
	setApiConfigurationField,
}: {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: <K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => void
}) => {
	return (
		<div>
			<VSCodeTextField
				type="password"
				value={apiConfiguration?.morphApiKey || ""}
				placeholder="Enter your Morph API key (optional)"
				onChange={(e) => setApiConfigurationField("morphApiKey", (e.target as any)?.value || "")}
				className="w-full">
				Morph API key (optional)
			</VSCodeTextField>
			<div className="text-xs">
				If you do not configure a Morph API key, you can still use Fast Apply with Kilo Code or OpenRouter, but
				your account will be billed for model usage!
			</div>
		</div>
	)
}
