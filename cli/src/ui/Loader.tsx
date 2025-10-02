import React, { useState } from "react"
import { Box, Text } from "ink"
import { UI } from "./UI.js"
import { useExtensionService } from "../state/hooks/useExtensionService.js"
import { useExtensionStateSync } from "../state/hooks/useExtensionStateSync.js"
import { AppOptions } from "./App.js"

export const Loader: React.FC<{ options: AppOptions; onExit: () => void }> = ({ options, onExit }) => {
	const { isReady, isInitializing, error } = useExtensionService()
	const [initError, setInitError] = useState<Error | null>(null)

	// Set up state synchronization with extension
	useExtensionStateSync()

	// Show loading state while initializing
	if (isInitializing) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan">Initializing Kilo Code...</Text>
			</Box>
		)
	}

	// Show error state if initialization failed
	if (error || initError) {
		const displayError = error || initError
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="red">Failed to initialize Kilo Code</Text>
				<Text color="red">{displayError?.message}</Text>
				<Text dimColor>Press Ctrl+C to exit</Text>
			</Box>
		)
	}

	// Show loading state if not ready yet
	if (!isReady) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="yellow">Waiting for extension to be ready...</Text>
			</Box>
		)
	}

	// Render main UI when ready
	return <UI options={options} onExit={onExit} />
}
