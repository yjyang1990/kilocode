import { TelemetryService } from "@roo-code/telemetry"
import { getCheckpointService } from ".."
import { DIFF_VIEW_URI_SCHEME } from "../../../integrations/editor/DiffViewProvider"
import { Task } from "../../task/Task"
import { t } from "../../../i18n"
import * as vscode from "vscode"
import { CommitRange } from "@roo-code/types"

function findLast<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
	let index = array.length - 1
	for (; index >= 0; index--) {
		if (predicate(array[index], index, array)) {
			break
		}
	}
	return index
}

export async function getCommitRangeForNewCompletion(task: Task): Promise<CommitRange | undefined> {
	try {
		const service = await getCheckpointService(task)
		if (!service) {
			return
		}

		const messages = task.clineMessages

		const firstCompletionIndexFromStart = messages.findIndex(
			(msg) => msg.type === "say" && msg.say === "completion_result",
		)
		const firstCommit =
			firstCompletionIndexFromStart >= 0
				? messages
						.slice(0, firstCompletionIndexFromStart)
						.find((msg) => msg.type === "say" && msg.say === "checkpoint_saved")?.text
				: undefined

		const lastCheckpointIndex = findLast(messages, (msg) => msg.type === "say" && msg.say === "checkpoint_saved")

		const previousCompletionIndex =
			lastCheckpointIndex >= 0
				? findLast(
						messages.slice(0, lastCheckpointIndex),
						(msg) => msg.type === "say" && msg.say === "completion_result",
					)
				: -1

		const previousCheckpointIndexFromEnd =
			previousCompletionIndex >= 0
				? findLast(
						messages.slice(0, previousCompletionIndex),
						(msg) => msg.type === "say" && msg.say === "checkpoint_saved",
					)
				: -1

		const toCommit = lastCheckpointIndex >= 0 ? messages[lastCheckpointIndex].text : undefined
		const fromCommit =
			previousCheckpointIndexFromEnd >= 0 ? messages[previousCheckpointIndexFromEnd].text : firstCommit

		if (!toCommit || !fromCommit || fromCommit === toCommit) {
			return undefined
		}

		const result = { to: toCommit, from: fromCommit }
		return (await service.getDiff(result)).length > 0 ? result : undefined
	} catch (err) {
		TelemetryService.instance.captureException(err, { context: "getCommitRangeForNewCompletion" })
		return undefined
	}
}

export async function showNewChanges(task: Task, commitRange: CommitRange) {
	try {
		const service = await getCheckpointService(task)
		if (!service) {
			vscode.window.showWarningMessage(t("kilocode:showNewChanges.checkpointsUnavailable"))
			return
		}

		const changes = await service.getDiff(commitRange)
		if (changes.length === 0) {
			vscode.window.showWarningMessage(t("kilocode:showNewChanges.noChanges"))
			return
		}

		await vscode.commands.executeCommand(
			"vscode.changes",
			t("kilocode:showNewChanges.title"),
			changes.map((change) => [
				vscode.Uri.file(change.paths.absolute),
				vscode.Uri.parse(`${DIFF_VIEW_URI_SCHEME}:${change.paths.relative}`).with({
					query: Buffer.from(change.content.before ?? "").toString("base64"),
				}),
				vscode.Uri.parse(`${DIFF_VIEW_URI_SCHEME}:${change.paths.relative}`).with({
					query: Buffer.from(change.content.after ?? "").toString("base64"),
				}),
			]),
		)
	} catch (err) {
		vscode.window.showErrorMessage(t("kilocode:showNewChanges.error"))
		TelemetryService.instance.captureException(err, { context: "showNewChanges" })
		return undefined
	}
}
