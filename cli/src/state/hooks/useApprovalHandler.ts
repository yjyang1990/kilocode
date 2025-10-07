/**
 * Hook for handling approval/rejection of ask messages
 * Provides methods to approve, reject, and navigate approval options
 */

import { useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect } from "react"
import {
	pendingApprovalAtom,
	approvalOptionsAtom,
	selectedApprovalIndexAtom,
	selectedApprovalOptionAtom,
	selectNextApprovalAtom,
	selectPreviousApprovalAtom,
	clearPendingApprovalAtom,
	isApprovalPendingAtom,
	shouldAutoApproveAtom,
	shouldAutoRejectAtom,
	type ApprovalOption,
} from "../atoms/approval.js"
import { autoApproveRetryDelayAtom, autoApproveQuestionTimeoutAtom } from "../atoms/config.js"
import { ciModeAtom } from "../atoms/ci.js"
import { useWebviewMessage } from "./useWebviewMessage.js"
import type { ExtensionChatMessage } from "../../types/messages.js"
import { logs } from "../../services/logs.js"
import { CI_MODE_MESSAGES } from "../../constants/ci.js"

/**
 * Options for useApprovalHandler hook
 */
export interface UseApprovalHandlerOptions {
	/** Whether CI mode is active (for testing/override purposes) */
	ciMode?: boolean
}

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
 * In CI mode, this hook automatically approves or rejects requests based on
 * configuration settings without user interaction.
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
export function useApprovalHandler(options: UseApprovalHandlerOptions = {}): UseApprovalHandlerReturn {
	const pendingApproval = useAtomValue(pendingApprovalAtom)
	const approvalOptions = useAtomValue(approvalOptionsAtom)
	const selectedIndex = useAtomValue(selectedApprovalIndexAtom)
	const selectedOption = useAtomValue(selectedApprovalOptionAtom)
	const isApprovalPending = useAtomValue(isApprovalPendingAtom)
	const shouldAutoApprove = useAtomValue(shouldAutoApproveAtom)
	const shouldAutoReject = useAtomValue(shouldAutoRejectAtom)
	const retryDelay = useAtomValue(autoApproveRetryDelayAtom)
	const questionTimeout = useAtomValue(autoApproveQuestionTimeoutAtom)
	const ciModeFromAtom = useAtomValue(ciModeAtom)

	// Use CI mode from options if provided, otherwise use atom value
	const isCIMode = options.ciMode ?? ciModeFromAtom

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

	// CI mode auto-approval/rejection effect for followup questions
	// Note: Most CI mode auto-approvals are now handled at the component level
	// to avoid race conditions. This effect only handles followup questions which
	// need special handling with a custom message.
	useEffect(() => {
		if (!isCIMode || !pendingApproval) {
			return
		}

		const isFollowup = pendingApproval.ask === "followup"

		// In CI mode, handle followup questions with special message
		if (isFollowup) {
			const handleFollowup = async () => {
				try {
					// Always approve followup questions with CI message
					logs.info(
						"CI mode: Auto-approving followup question with non-interactive message",
						"useApprovalHandler",
					)
					await approve(CI_MODE_MESSAGES.FOLLOWUP_RESPONSE)
				} catch (error) {
					logs.error("CI mode: Failed to auto-approve followup question", "useApprovalHandler", { error })
				}
			}

			handleFollowup()
		}
	}, [isCIMode, pendingApproval, approve])

	// Regular auto-approval effect (for non-CI mode)
	useEffect(() => {
		// Skip if in CI mode (handled by CI effect above)
		if (isCIMode || !pendingApproval || !shouldAutoApprove) {
			return
		}

		const isRetry = pendingApproval.ask === "api_req_failed"
		const isQuestion = pendingApproval.ask === "followup"

		// Convert seconds to milliseconds for delay
		let delay = 0
		if (isRetry) {
			delay = retryDelay * 1000
		} else if (isQuestion) {
			delay = questionTimeout * 1000
		}

		logs.info(
			`Auto-approving ${pendingApproval.ask} request${delay > 0 ? ` after ${delay / 1000}s delay` : ""}`,
			"useApprovalHandler",
		)

		const timeoutId = setTimeout(() => {
			approve().catch((error) => {
				logs.error("Failed to auto-approve request", "useApprovalHandler", { error })
			})
		}, delay)

		return () => clearTimeout(timeoutId)
	}, [isCIMode, pendingApproval, shouldAutoApprove, approve, retryDelay, questionTimeout])

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
