import React from "react"
import { Box } from "ink"
import { Text } from "../../../common/Text.js"
import TextInput from "ink-text-input"
import { SectionHeader } from "../common/SectionHeader.js"
import { Section } from "../common/Section.js"

interface NavigationOption {
	id: string
	type: "field" | "action"
	label: string
	value: string
	field?: string
	actualValue?: string
	action?: () => void
}

interface ProvidersSectionProps {
	navigationOptions: NavigationOption[]
	selectedIndex: number
}

export const ProvidersSection: React.FC<ProvidersSectionProps> = ({ navigationOptions, selectedIndex }) => {
	return (
		<Box flexDirection="column">
			<SectionHeader title="Providers" description="Configure your AI provider settings" />
			<Section>
				<Box flexDirection="column" gap={1}>
					{navigationOptions.map((option, index) => {
						const isAction = option.type === "action"
						return (
							<Box
								key={`${option.id}-${option.label}`}
								justifyContent={isAction ? "flex-start" : "space-between"}
								paddingX={selectedIndex === index ? 1 : 0}>
								<Text color={selectedIndex === index ? "cyan" : "white"}>
									{selectedIndex === index ? "❯ " : "  "}
									{option.label}
									{isAction ? "" : ":"}
								</Text>
								{!isAction && (
									<Text color={selectedIndex === index ? "cyan" : "gray"}>
										{option.value || "Not set"}
									</Text>
								)}
							</Box>
						)
					})}

					{navigationOptions.length === 0 && (
						<Text color="gray" dimColor>
							No options available
						</Text>
					)}

					<Box marginTop={1}>
						<Text color="gray" dimColor>
							↑/↓ Navigate • Enter Select/Edit • Esc Back
						</Text>
					</Box>
				</Box>
			</Section>
		</Box>
	)
}
