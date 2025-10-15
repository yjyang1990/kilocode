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
			<div className="flex items-center gap-2 px-4 py-2 mb-2 text-sm rounded bg-vscode-inputValidation-warningBackground border border-vscode-inputValidation-warningBorder">
				<span className="codicon codicon-warning text-vscode-editorWarning-foreground" />
				<span className="text-vscode-foreground">
					{t("kilocode:memoryWarning.message", { percentage: memoryPercentage })}
				</span>
			</div>
		)
	)
}
