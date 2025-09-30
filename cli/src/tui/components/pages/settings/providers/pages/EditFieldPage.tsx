import React, { useState, useEffect } from "react"
import { Box } from "ink"
import { Text } from "../../../../common/Text.js"
import TextInput from "ink-text-input"
import { PageHeader } from "../../../../generic/PageHeader.js"
import { PageLayout } from "../../../../layout/PageLayout.js"
import { SettingsLayout } from "../../common/SettingsLayout.js"
import { SectionHeader } from "../../common/SectionHeader.js"
import { Section } from "../../common/Section.js"
import { useKeyboardNavigation } from "../../../../../hooks/useKeyboardNavigation.js"
import { useExtensionState, useExtensionMessage, useSidebar } from "../../../../../context/index.js"
import { useRouter, useParams } from "../../../../../router/index.js"
import {
	getFieldInfo,
	isSensitiveField,
	isOptionalField,
	isModelField,
	providerSupportsModelList,
} from "../../../../../../constants/providers/index.js"
import type { ProviderName } from "../../../../../../types/messages.js"

export const EditFieldPage: React.FC = () => {
	const extensionState = useExtensionState()
	const { sendMessage } = useExtensionMessage()
	const { visible: sidebarVisible } = useSidebar()
	const router = useRouter()
	const params = useParams()
	const [fieldValue, setFieldValue] = useState("")
	const [error, setError] = useState<string | null>(null)

	const apiConfig = extensionState?.apiConfiguration || {}
	const currentApiConfigName = extensionState?.currentApiConfigName || "default"
	const fieldName = params.field as string

	// Check if this is a model field and redirect to model selector
	useEffect(() => {
		const provider = apiConfig.apiProvider as ProviderName
		if (fieldName && isModelField(fieldName) && provider && providerSupportsModelList(provider)) {
			// Redirect to model selector instead
			router.navigate(`/settings/providers/choose-model?provider=${provider}&field=${fieldName}`)
			return
		}
	}, [fieldName, apiConfig.apiProvider, router])

	// Initialize with current field value when component mounts
	useEffect(() => {
		if (fieldName && apiConfig[fieldName] !== undefined) {
			setFieldValue(String(apiConfig[fieldName] || ""))
		}
		setError(null)
	}, [fieldName, apiConfig])

	// Get field display information - now using centralized constants

	const fieldInfo = getFieldInfo(fieldName)

	const validateField = (value: string): string | null => {
		// Basic validation - can be extended based on field type
		if (fieldName.includes("Url") && value.trim() && !isValidUrl(value.trim())) {
			return "Invalid URL format"
		}
		return null
	}

	const isValidUrl = (url: string): boolean => {
		try {
			new URL(url)
			return true
		} catch {
			return false
		}
	}

	const handleSubmit = async () => {
		const validationError = validateField(fieldValue)
		if (validationError) {
			setError(validationError)
			return
		}

		try {
			let value: any = fieldValue.trim()

			// Handle boolean fields
			if (value.toLowerCase() === "true") {
				value = true
			} else if (value.toLowerCase() === "false") {
				value = false
			}

			// Handle empty values for optional fields
			if (!value && isOptionalField(fieldName)) {
				value = ""
			}

			const updatedConfig = {
				...apiConfig,
				[fieldName]: value,
			}

			await sendMessage({
				type: "upsertApiConfiguration",
				text: currentApiConfigName,
				apiConfiguration: updatedConfig,
			})

			// Navigate back to providers list on success
			router.goBack()
		} catch (error) {
			console.error("Failed to save field:", error)
			setError("Failed to save field")
		}
	}

	const handleCancel = () => {
		router.goBack()
	}

	// Keyboard navigation
	useKeyboardNavigation({
		sidebarVisible,
		customHandlers: {
			return: () => {
				handleSubmit()
			},
			escape: () => {
				handleCancel()
			},
		},
	})

	const header = <PageHeader title={`Settings - Providers - Edit ${fieldInfo.label}`} />

	const content = (
		<SettingsLayout isIndexPage={false}>
			<Box flexDirection="column">
				<SectionHeader
					title={`Edit ${fieldInfo.label}`}
					description={`Update the ${fieldInfo.label.toLowerCase()} for your provider configuration`}
				/>
				<Section>
					<Box flexDirection="column" gap={1}>
						<Text>{fieldInfo.label}:</Text>
						{isSensitiveField(fieldName) ? (
							<TextInput
								value={fieldValue}
								onChange={setFieldValue}
								onSubmit={handleSubmit}
								placeholder={fieldInfo.placeholder}
								mask="*"
							/>
						) : (
							<TextInput
								value={fieldValue}
								onChange={setFieldValue}
								onSubmit={handleSubmit}
								placeholder={fieldInfo.placeholder}
							/>
						)}

						{error && <Text color="red">Error: {error}</Text>}

						<Box justifyContent="flex-start" gap={4} marginTop={1}>
							<Text color="gray" dimColor>
								[Esc] Cancel
							</Text>
							<Text color="gray" dimColor>
								[Enter] Save
							</Text>
						</Box>
					</Box>
				</Section>
			</Box>
		</SettingsLayout>
	)

	return <PageLayout header={header}>{content}</PageLayout>
}
