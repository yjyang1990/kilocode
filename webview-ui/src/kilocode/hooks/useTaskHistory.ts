import { ExtensionMessage } from "@roo/ExtensionMessage"
import { TaskHistoryResponsePayload } from "@roo/WebviewMessage"
import { vscode } from "@src/utils/vscode"
import { useQuery } from "@tanstack/react-query"

function fetchTaskHistory(): Promise<TaskHistoryResponsePayload> {
	return new Promise((resolve, reject) => {
		const cleanup = () => window.removeEventListener("message", handle)

		const timeout = setTimeout(() => {
			cleanup()
			reject(new Error("Timeout"))
		}, 10000)

		const handle = (event: MessageEvent) => {
			const message = event.data as ExtensionMessage
			if (message.type === "taskHistoryResponse") {
				clearTimeout(timeout)
				cleanup()
				const result = message.payload as TaskHistoryResponsePayload
				if (result) {
					resolve(result)
				} else {
					reject(new Error("Payload is empty"))
				}
			}
		}

		window.addEventListener("message", handle)
		vscode.postMessage({ type: "taskHistoryRequest" })
	})
}

export function useTaskHistory() {
	return useQuery({
		queryKey: ["taskHistory"], // todo
		queryFn: fetchTaskHistory,
	})
}
