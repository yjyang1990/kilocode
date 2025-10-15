import { useEffect, useState } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"

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

const warningThreshold = 80

const resetThreshold = 50

export const MemoryWarning = () => {
	const { t } = useAppTranslation()
	const [enable, setEnabled] = useState(true)
	const [memoryPercentage, setMemoryPercentage] = useState(getMemoryPercentage())

	useEffect(() => {
		const handle = setInterval(() => {
			const percentage = getMemoryPercentage()
			if (percentage < resetThreshold) {
				setEnabled(true)
			}
			setMemoryPercentage(percentage)
		}, 1000)
		return () => clearInterval(handle)
	}, [])

	return (
		enable &&
		memoryPercentage >= warningThreshold && (
			<div className="fixed z-[9999] left-4 top-4 right-4">
				<div
					className="flex items-center gap-3 p-4 text-lg rounded shadow-lg border"
					style={{
						backgroundColor: "var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1))",
						borderColor: "var(--vscode-inputValidation-errorBorder, #ff0000)",
						color: "var(--vscode-errorForeground, #ff0000)",
					}}>
					<span className="codicon codicon-warning" />
					<span className="font-semibold">
						{t("kilocode:memoryWarning.message", { percentage: memoryPercentage })}
					</span>
					<button className="codicon codicon-close" onClick={() => setEnabled(false)}></button>
				</div>
			</div>
		)
	)
}
