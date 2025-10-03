/**
 * Hook for handling approval/rejection of ask messages
 * Provides methods to approve, reject, and navigate approval options
 */

import { useAtomValue, useSetAtom } from "jotai"
import { useCallback } from "react"
import {
	pendingApprovalAtom,
	approvalOptionsAtom,
	selectedApprovalIndexAtom,
	selectedApprovalOptionAtom,
	selectNextApprovalAtom,
	selectPreviousApprovalAtom,
	clearPendingApprovalAtom,
	isApprovalPendingAtom,
	type ApprovalOption,
} from "../atoms/approval.js"
import { useWebviewMessage } from "./useWebviewMessage.js"
import type { ExtensionChatMessage } from "../../types/messages.js"
import { logs } from "../../services/logs.js"

/**
 * Return type for useApprovalHandler hook
 */
export interface UseApprovalHandlerReturn {
	/** The message currently awaiting approval */
	pendingApproval: ExtensionChatMessage | null
	/** Available approval options */
	approvalOptions: ApprovalOption[]
	/** Currently selected option index */
	selectedIndex: number
	/** Currently selected option */
	selectedOption: ApprovalOption | null
	/** Whether approval is pending */
	isApprovalPending: boolean
	/** Select the next option */
	selectNext: () => void
	/** Select the previous option */
	selectPrevious: () => void
	/** Approve the pending request */
	approve: (text?: string, images?: string[]) => Promise<void>
	/** Reject the pending request */
	reject: (text?: string, images?: string[]) => Promise<void>
	/** Execute the currently selected option */
	executeSelected: (text?: string, images?: string[]) => Promise<void>
}

/**
 * Hook that provides approval/rejection functionality
 *
 * This hook manages the approval flow for ask messages, providing methods
 * to approve, reject, and navigate between options.
 *
 * @example
 * ```tsx
 * function ApprovalUI() {
 *   const { pendingApproval, approve, reject, isApprovalPending } = useApprovalHandler()
 *
 *   if (!isApprovalPending) return null
 *
 *   return (
 *     <div>
 *       <button onClick={() => approve()}>Approve</button>
 *       <button onClick={() => reject()}>Reject</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useApprovalHandler(): UseApprovalHandlerReturn {
	const pendingApproval = useAtomValue(pendingApprovalAtom)
	const approvalOptions = useAtomValue(approvalOptionsAtom)
	const selectedIndex = useAtomValue(selectedApprovalIndexAtom)
	const selectedOption = useAtomValue(selectedApprovalOptionAtom)
	const isApprovalPending = useAtomValue(isApprovalPendingAtom)

	const selectNext = useSetAtom(selectNextApprovalAtom)
	const selectPrevious = useSetAtom(selectPreviousApprovalAtom)
	const clearPendingApproval = useSetAtom(clearPendingApprovalAtom)

	const { sendAskResponse } = useWebviewMessage()

	const approve = useCallback(
		async (text?: string, images?: string[]) => {
			if (!pendingApproval) {
				logs.warn("No pending approval to approve", "useApprovalHandler")
				return
			}

			try {
				logs.debug("Approving request", "useApprovalHandler", { ask: pendingApproval.ask })

				await sendAskResponse({
					response: "yesButtonClicked",
					...(text && { text }),
					...(images && { images }),
				})

				clearPendingApproval()
			} catch (error) {
				logs.error("Failed to approve request", "useApprovalHandler", { error })
				throw error
			}
		},
		[pendingApproval, sendAskResponse, clearPendingApproval],
	)

	const reject = useCallback(
		async (text?: string, images?: string[]) => {
			if (!pendingApproval) {
				logs.warn("No pending approval to reject", "useApprovalHandler")
				return
			}

			try {
				logs.debug("Rejecting request", "useApprovalHandler", { ask: pendingApproval.ask })

				await sendAskResponse({
					response: "noButtonClicked",
					...(text && { text }),
					...(images && { images }),
				})

				clearPendingApproval()
			} catch (error) {
				logs.error("Failed to reject request", "useApprovalHandler", { error })
				throw error
			}
		},
		[pendingApproval, sendAskResponse, clearPendingApproval],
	)

	const executeSelected = useCallback(
		async (text?: string, images?: string[]) => {
			if (!selectedOption) {
				logs.warn("No option selected", "useApprovalHandler")
				return
			}

			if (selectedOption.action === "approve") {
				await approve(text, images)
			} else {
				await reject(text, images)
			}
		},
		[selectedOption, approve, reject],
	)

	return {
		pendingApproval,
		approvalOptions,
		selectedIndex,
		selectedOption,
		isApprovalPending,
		selectNext,
		selectPrevious,
		approve,
		reject,
		executeSelected,
	}
}
