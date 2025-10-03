/**
 * Approval state atoms
 * These atoms manage the approval/rejection flow for ask messages
 */

import { atom } from "jotai"
import type { ExtensionChatMessage } from "../../types/messages.js"

/**
 * Approval option interface
 */
export interface ApprovalOption {
	label: string
	action: "approve" | "reject"
	hotkey: string
	color: "green" | "red"
}

/**
 * Atom to hold the message currently awaiting approval
 */
export const pendingApprovalAtom = atom<ExtensionChatMessage | null>(null)

/**
 * Atom to track the selected approval option index
 */
export const selectedApprovalIndexAtom = atom<number>(0)

/**
 * Derived atom to check if there's a pending approval
 */
export const isApprovalPendingAtom = atom<boolean>((get) => {
	return get(pendingApprovalAtom) !== null
})

/**
 * Derived atom to get approval options based on the pending message type
 */
export const approvalOptionsAtom = atom<ApprovalOption[]>((get) => {
	const pendingMessage = get(pendingApprovalAtom)

	if (!pendingMessage || pendingMessage.type !== "ask") {
		return []
	}

	// Determine button labels based on ask type
	let approveLabel = "Approve"
	let rejectLabel = "Reject"

	if (pendingMessage.ask === "tool") {
		try {
			const toolData = JSON.parse(pendingMessage.text || "{}")
			const tool = toolData.tool

			if (
				["editedExistingFile", "appliedDiff", "newFileCreated", "insertContent", "generateImage"].includes(tool)
			) {
				approveLabel = "Save"
			}
		} catch {
			// Keep default labels
		}
	} else if (pendingMessage.ask === "command") {
		approveLabel = "Run Command"
	}

	return [
		{
			label: approveLabel,
			action: "approve" as const,
			hotkey: "y",
			color: "green" as const,
		},
		{
			label: rejectLabel,
			action: "reject" as const,
			hotkey: "n",
			color: "red" as const,
		},
	]
})

/**
 * Action atom to set the pending approval message
 */
export const setPendingApprovalAtom = atom(null, (get, set, message: ExtensionChatMessage | null) => {
	set(pendingApprovalAtom, message)
	set(selectedApprovalIndexAtom, 0) // Reset selection
})

/**
 * Action atom to clear the pending approval
 */
export const clearPendingApprovalAtom = atom(null, (get, set) => {
	set(pendingApprovalAtom, null)
	set(selectedApprovalIndexAtom, 0)
})

/**
 * Action atom to select the next approval option
 */
export const selectNextApprovalAtom = atom(null, (get, set) => {
	const options = get(approvalOptionsAtom)
	if (options.length === 0) return

	const currentIndex = get(selectedApprovalIndexAtom)
	const nextIndex = (currentIndex + 1) % options.length
	set(selectedApprovalIndexAtom, nextIndex)
})

/**
 * Action atom to select the previous approval option
 */
export const selectPreviousApprovalAtom = atom(null, (get, set) => {
	const options = get(approvalOptionsAtom)
	if (options.length === 0) return

	const currentIndex = get(selectedApprovalIndexAtom)
	const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
	set(selectedApprovalIndexAtom, prevIndex)
})

/**
 * Derived atom to get the currently selected approval option
 */
export const selectedApprovalOptionAtom = atom<ApprovalOption | null>((get) => {
	const options = get(approvalOptionsAtom)
	const selectedIndex = get(selectedApprovalIndexAtom)

	return options[selectedIndex] ?? null
})
