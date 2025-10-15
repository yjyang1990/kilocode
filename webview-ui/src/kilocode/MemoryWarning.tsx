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

const threshold = 10

export const MemoryWarning = () => {
	const { t } = useAppTranslation()
	const [memoryPercentage, setMemoryPercentage] = useState(getMemoryPercentage())

	useEffect(() => {
		const handle = setInterval(() => {
			setMemoryPercentage(getMemoryPercentage())
		}, 1000)
		return () => clearInterval(handle)
	}, [])

	return (
		memoryPercentage >= threshold && (
			<div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] mx-4 max-w-2xl w-full">
				<div
					className="flex items-center gap-3 px-6 py-4 text-base rounded-lg shadow-lg border-2"
					style={{
						backgroundColor: "var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1))",
						borderColor: "var(--vscode-inputValidation-errorBorder, #ff0000)",
						color: "var(--vscode-errorForeground, #ff0000)",
					}}>
					<span
						className="codicon codicon-warning text-2xl flex-shrink-0"
						style={{
							color: "var(--vscode-errorForeground, #ff0000)",
						}}
					/>
					<span className="font-semibold flex-1">
						{t("kilocode:memoryWarning.message", { percentage: memoryPercentage })}
					</span>
				</div>
			</div>
		)
	)
}
