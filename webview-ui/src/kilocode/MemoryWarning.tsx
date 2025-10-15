import { useEffect, useState } from "react"

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
	const [memoryPercentage, setMemoryPercentage] = useState(getMemoryPercentage())

	useEffect(() => {
		const handle = setInterval(() => {
			setMemoryPercentage(getMemoryPercentage())
		}, 1000)
		return () => clearInterval(handle)
	}, [])

	return (
		memoryPercentage >= threshold && (
			<div>Warning! Memory usage is {memoryPercentage}%, please restart your IDE.</div>
		)
	)
}
