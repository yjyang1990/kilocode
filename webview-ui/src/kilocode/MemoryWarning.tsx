import { useEffect, useState } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { telemetryClient } from "../utils/TelemetryClient"
import { TelemetryEventName } from "@roo-code/types"

function getMemoryPercentage() {
	if ("memory" in performance && typeof performance.memory === "object") {
		const memory = performance.memory as {
			totalJSHeapSize: number
			usedJSHeapSize: number
			jsHeapSizeLimit: number
		}
		return Math.floor((100 * memory.totalJSHeapSize) / memory.jsHeapSizeLimit)
	}
	return 0
}

const warningThreshold = 90

const resetCloseButtonThreshold = 50

let warningReported = false

function reportWarning() {
	if (!warningReported) {
		warningReported = true
		telemetryClient.capture(TelemetryEventName.MEMORY_WARNING_SHOWN)
	}
}

export const MemoryWarning = () => {
	const { t } = useAppTranslation()
	const [enable, setEnabled] = useState(true)
	const [memoryPercentage, setMemoryPercentage] = useState(getMemoryPercentage())

	useEffect(() => {
		const handle = setInterval(() => {
			const percentage = getMemoryPercentage()
			if (percentage < resetCloseButtonThreshold) {
				setEnabled(true)
			}
			if (percentage >= warningThreshold) {
				reportWarning()
			}
			setMemoryPercentage(percentage)
		}, 1000)
		return () => clearInterval(handle)
	}, [])

	return (
		enable &&
		memoryPercentage >= warningThreshold && (
			<div className="fixed z-[9999] left-2 top-2 right-2">
				<div
					className="flex items-center gap-3 p-4 text-lg rounded shadow-lg border"
					style={{
						backgroundColor: "var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1))",
						borderColor: "var(--vscode-inputValidation-errorBorder, #ff0000)",
						color: "var(--vscode-errorForeground, #ff0000)",
					}}>
					<span className="codicon codicon-warning" />
					<span className="flex-1 font-semibold">
						{t("kilocode:memoryWarning.message", { percentage: memoryPercentage })}
					</span>
					<button className="codicon codicon-close" onClick={() => setEnabled(false)}></button>
				</div>
			</div>
		)
	)
}
