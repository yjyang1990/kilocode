import React, { useEffect, useState } from "react"
import { Provider as JotaiProvider } from "jotai"
import { logs } from "../services/logs.js"
import { Loader } from "./Loader.js"

type JotaiStore = any

export interface AppOptions {
	initialMode?: string
	workspace?: string
	autoApprove?: boolean
}

export interface AppProps {
	store: JotaiStore
	options: AppOptions
	onExit: () => void
}

export const App: React.FC<AppProps> = ({ store, options, onExit }) => {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		return () => {
			setMounted(false)
			logs.debug("App component unmounting", "App")
		}
	}, [])

	if (!mounted) {
		return null
	}

	return (
		<JotaiProvider store={store}>
			<Loader options={options} onExit={onExit} />
		</JotaiProvider>
	)
}
