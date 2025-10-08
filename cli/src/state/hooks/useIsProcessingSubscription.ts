import { useAtomValue, useSetAtom } from "jotai"
import { isProcessingAtom } from "../atoms/ui.js"
import { useEffect } from "react"
import { useExtensionMessage } from "./useExtensionMessage.js"

export default function useIsProcessingSubscription() {
	const { lastMessage } = useExtensionMessage()
	const setIsProcessing = useSetAtom(isProcessingAtom)

	useEffect(() => {
		if (!lastMessage) return

		if (lastMessage.type === "ask" && lastMessage.ask === "completion_result") {
			setIsProcessing(false)
		}
	}, [lastMessage])

	return null
}
