import React, { useEffect } from "react"
import { Box, Text } from "ink"
import { useAtomValue, useSetAtom } from "jotai"
import type { ToolMessageProps } from "../types.js"
import {
	setPendingApprovalAtom,
	shouldAutoApproveAtom,
	shouldAutoRejectAtom,
} from "../../../../state/atoms/approval.js"
import { ciModeAtom } from "../../../../state/atoms/ci.js"
import { useApprovalHandler } from "../../../../state/hooks/useApprovalHandler.js"
import { CI_MODE_MESSAGES } from "../../../../constants/ci.js"
import { logs } from "../../../../services/logs.js"
import {
	ToolEditedExistingFileMessage,
	ToolInsertContentMessage,
	ToolSearchAndReplaceMessage,
	ToolNewFileCreatedMessage,
	ToolReadFileMessage,
	ToolGenerateImageMessage,
	ToolListFilesTopLevelMessage,
	ToolListFilesRecursiveMessage,
	ToolListCodeDefinitionNamesMessage,
	ToolSearchFilesMessage,
	ToolCodebaseSearchMessage,
	ToolUpdateTodoListMessage,
	ToolSwitchModeMessage,
	ToolNewTaskMessage,
	ToolFinishTaskMessage,
	ToolFetchInstructionsMessage,
	ToolRunSlashCommandMessage,
} from "./index.js"

/**
 * Routes tool data to the appropriate component based on tool type
 */
export const ToolRouter: React.FC<ToolMessageProps> = ({ message, toolData }) => {
	const setPendingApproval = useSetAtom(setPendingApprovalAtom)
	const isCIMode = useAtomValue(ciModeAtom)
	const shouldAutoApprove = useAtomValue(shouldAutoApproveAtom)
	const shouldAutoReject = useAtomValue(shouldAutoRejectAtom)
	const { approve, reject } = useApprovalHandler()

	// Set this message as pending approval if not already answered
	// In CI mode, handle auto-approval immediately to avoid race conditions
	useEffect(() => {
		if (!message.isAnswered && !message.partial) {
			setPendingApproval(message)

			// In CI mode, handle auto-approval/rejection immediately
			// This eliminates the race condition with the useApprovalHandler hook
			if (isCIMode) {
				const tool = toolData.tool

				if (shouldAutoApprove) {
					logs.info(`CI mode: Auto-approving tool: ${tool}`, "ToolRouter")
					approve().catch((error) => {
						logs.error("CI mode: Failed to auto-approve tool", "ToolRouter", { error })
					})
				} else if (shouldAutoReject) {
					logs.info(`CI mode: Auto-rejecting tool: ${tool}`, "ToolRouter")
					reject(CI_MODE_MESSAGES.AUTO_REJECTED).catch((error) => {
						logs.error("CI mode: Failed to auto-reject tool", "ToolRouter", { error })
					})
				}
			}
		}

		// Clear pending approval when component unmounts
		return () => {
			setPendingApproval(null)
		}
	}, [
		message,
		message.isAnswered,
		message.partial,
		setPendingApproval,
		isCIMode,
		shouldAutoApprove,
		shouldAutoReject,
		approve,
		reject,
		toolData.tool,
	])
	switch (toolData.tool) {
		case "editedExistingFile":
		case "appliedDiff":
			return <ToolEditedExistingFileMessage message={message} toolData={toolData} />

		case "insertContent":
			return <ToolInsertContentMessage message={message} toolData={toolData} />

		case "searchAndReplace":
			return <ToolSearchAndReplaceMessage message={message} toolData={toolData} />

		case "newFileCreated":
			return <ToolNewFileCreatedMessage message={message} toolData={toolData} />

		case "readFile":
			return <ToolReadFileMessage message={message} toolData={toolData} />

		case "generateImage":
			return <ToolGenerateImageMessage message={message} toolData={toolData} />

		case "listFilesTopLevel":
			return <ToolListFilesTopLevelMessage message={message} toolData={toolData} />

		case "listFilesRecursive":
			return <ToolListFilesRecursiveMessage message={message} toolData={toolData} />

		case "listCodeDefinitionNames":
			return <ToolListCodeDefinitionNamesMessage message={message} toolData={toolData} />

		case "searchFiles":
			return <ToolSearchFilesMessage message={message} toolData={toolData} />

		case "codebaseSearch":
			return <ToolCodebaseSearchMessage message={message} toolData={toolData} />

		case "updateTodoList":
			return <ToolUpdateTodoListMessage message={message} toolData={toolData} />

		case "switchMode":
			return <ToolSwitchModeMessage message={message} toolData={toolData} />

		case "newTask":
			return <ToolNewTaskMessage message={message} toolData={toolData} />

		case "finishTask":
			return <ToolFinishTaskMessage message={message} toolData={toolData} />

		case "fetchInstructions":
			return <ToolFetchInstructionsMessage message={message} toolData={toolData} />

		case "runSlashCommand":
			return <ToolRunSlashCommandMessage message={message} toolData={toolData} />

		default:
			return (
				<Box marginY={1}>
					<Text color="gray">⚙ Unknown tool: {toolData.tool}</Text>
				</Box>
			)
	}
}
