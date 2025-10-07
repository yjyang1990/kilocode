import React from "react"

interface ChatTimestampsProps {
	ts: number
}

const ChatTimestamps: React.FC<ChatTimestampsProps> = ({ ts }) => {
	return (
		<span
			style={{
				fontSize: "11px",
				color: "var(--vscode-descriptionForeground)",
				fontWeight: "normal",
			}}>
			{new Date(ts).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})}
		</span>
	)
}

export default ChatTimestamps
