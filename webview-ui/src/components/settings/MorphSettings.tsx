// kilocode_change: Morph fast apply
/*
import { ProviderSettings } from "@roo-code/types"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { Checkbox } from "vscrui"
import { inputEventTransform } from "./transforms"

interface MorphSettingsProps {
	apiConfiguration: ProviderSettings
	handleInputChange: <K extends keyof ProviderSettings, E>(
		field: K,
		transform?: (event: E) => ProviderSettings[K],
	) => (event: E | Event) => void
	setApiConfigurationField: <K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => void
	setUserUnselectedMorph: (value: boolean) => void
}

export const MorphSettings = ({
	apiConfiguration,
	handleInputChange,
	setApiConfigurationField,
	setUserUnselectedMorph,
}: MorphSettingsProps) => {
	const handleMorphEnabledChange = (enabled: boolean) => {
		setApiConfigurationField("morphEnabled", enabled)

		// Track if user unselected morph while on OpenRouter
		if (!enabled && apiConfiguration.apiProvider === "openrouter") {
			setUserUnselectedMorph(true)
		}
	}

	return (
		<div className="space-y-3">
			<Checkbox
				checked={apiConfiguration.morphEnabled || false}
				onChange={handleMorphEnabledChange}
				data-testid="morph-enabled-checkbox">
				Enable Editing with Morph FastApply
			</Checkbox>
			{apiConfiguration.morphEnabled && (
				<div className="space-y-3 pl-6">
					{apiConfiguration.apiProvider !== "openrouter" && (
						<>
							<div className="text-xs text-vscode-descriptionForeground">
								Configure Morph for AI-powered fast file editing.
							</div>
							<VSCodeTextField
								type="password"
								value={apiConfiguration.morphApiKey || ""}
								placeholder="Enter your Morph API key (optional)"
								onInput={handleInputChange("morphApiKey", inputEventTransform)}
								data-testid="morph-api-key"
								className="w-full">
								API Key
							</VSCodeTextField>
						</>
					)}
				</div>
			)}
		</div>
	)
}*/
