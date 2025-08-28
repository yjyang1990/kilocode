import { ClineMessage } from "@roo-code/types"

type Entry = { ts: number; commitHash: string }

export type CommitRange = { from: string; to: string }

export function getCommitRangesForCompletions(messages: ClineMessage[]): Map<number, CommitRange> {
	const firstCompletionIndex = messages.findIndex((msg) => msg.type === "say" && msg.say === "completion_result")
	const firstCommit =
		messages.slice(0, firstCompletionIndex).find((msg) => msg.type === "say" && msg.say === "checkpoint_saved")
			?.text ?? ""

	const commitBeforeCompletions = new Array<{ ts: number; commitHash: string }>()

	let currentEntry: Entry | undefined
	for (const msg of messages.toReversed()) {
		if (msg.type === "say" && msg.say === "completion_result") {
			currentEntry = { ts: msg.ts, commitHash: "" }
			commitBeforeCompletions.push(currentEntry)
		}
		if (msg.type === "say" && msg.say === "checkpoint_saved" && currentEntry && !currentEntry.commitHash) {
			currentEntry.commitHash = msg.text ?? ""
		}
	}

	return new Map<number, CommitRange>(
		commitBeforeCompletions
			.map((entry, index) => ({
				ts: entry.ts,
				to: entry.commitHash,
				from:
					index === commitBeforeCompletions.length - 1
						? firstCommit
						: commitBeforeCompletions[index + 1].commitHash,
			}))
			.filter((entry) => entry.from && entry.to && entry.from !== entry.to)
			.map((entry) => [entry.ts, { from: entry.from, to: entry.to }]),
	)
}
