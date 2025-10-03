# Extension Message Components Architecture

## ✅ IMPLEMENTATION STATUS: COMPLETED

**Completion Date:** 2025-10-03

This implementation is now **COMPLETE**. All 49 message components have been successfully implemented, tested, and documented. The system is production-ready and fully functional.

### What Was Completed:

- ✅ 11 ASK message components
- ✅ 21 SAY message components
- ✅ 17 TOOL components
- ✅ 3 Router components (AskMessageRouter, SayMessageRouter, ToolRouter)
- ✅ Shared types and utilities
- ✅ Error boundary integration
- ✅ Comprehensive documentation
- ✅ Test coverage
- ✅ Manual testing script

See [`README.md`](./README.md) for complete documentation.

---

## Overview

This document outlines the architecture for the individual React components that handle different extension message types in the CLI interface. Each component is designed to be visually appealing using Ink's full feature set.

## Directory Structure

```
cli/src/ui/messages/extension/
├── ExtensionMessageRow.tsx          # Main orchestrator component
├── ARCHITECTURE.md                   # This file
├── types.ts                          # Shared TypeScript types
├── utils.ts                          # Shared utility functions
├── ask/                              # ASK message type components
│   ├── index.ts
│   ├── AskToolMessage.tsx
│   ├── AskMistakeLimitMessage.tsx
│   ├── AskCommandMessage.tsx
│   ├── AskUseMcpServerMessage.tsx
│   ├── AskCompletionResultMessage.tsx
│   ├── AskFollowupMessage.tsx
│   ├── AskCondenseMessage.tsx
│   ├── AskPaymentRequiredMessage.tsx
│   ├── AskInvalidModelMessage.tsx
│   ├── AskReportBugMessage.tsx
│   └── AskAutoApprovalMaxReachedMessage.tsx
├── say/                              # SAY message type components
│   ├── index.ts
│   ├── SayTextMessage.tsx
│   ├── SayErrorMessage.tsx
│   ├── SayDiffErrorMessage.tsx
│   ├── SaySubtaskResultMessage.tsx
│   ├── SayReasoningMessage.tsx
│   ├── SayApiReqStartedMessage.tsx
│   ├── SayUserFeedbackMessage.tsx
│   ├── SayUserFeedbackDiffMessage.tsx
│   ├── SayCompletionResultMessage.tsx
│   ├── SayShellIntegrationWarningMessage.tsx
│   ├── SayCheckpointSavedMessage.tsx
│   ├── SayCondenseContextMessage.tsx
│   ├── SayCondenseContextErrorMessage.tsx
│   ├── SayCodebaseSearchResultMessage.tsx
│   ├── SayBrowserActionResultMessage.tsx
│   ├── SayUserEditTodosMessage.tsx
│   ├── SayToolMessage.tsx
│   ├── SayImageMessage.tsx
│   └── SayMcpServerRequestStartedMessage.tsx
└── tools/                            # TOOL type components (used by both ask and say)
    ├── index.ts
    ├── ToolEditedExistingFileMessage.tsx
    ├── ToolInsertContentMessage.tsx
    ├── ToolSearchAndReplaceMessage.tsx
    ├── ToolNewFileCreatedMessage.tsx
    ├── ToolReadFileMessage.tsx
    ├── ToolGenerateImageMessage.tsx
    ├── ToolListFilesTopLevelMessage.tsx
    ├── ToolListFilesRecursiveMessage.tsx
    ├── ToolListCodeDefinitionNamesMessage.tsx
    ├── ToolSearchFilesMessage.tsx
    ├── ToolCodebaseSearchMessage.tsx
    ├── ToolUpdateTodoListMessage.tsx
    ├── ToolSwitchModeMessage.tsx
    ├── ToolNewTaskMessage.tsx
    ├── ToolFinishTaskMessage.tsx
    ├── ToolFetchInstructionsMessage.tsx
    └── ToolRunSlashCommandMessage.tsx
```

## Component Design Principles

### 1. Visual Appeal with Ink Features

Each component should leverage Ink's full feature set:

- **Box**: For layout, borders, padding, margins
- **Text**: With color, bold, italic, underline, dimColor props
- **Newline**: For spacing between elements
- **Borders**: Single, double, round, bold styles with colors
- **Gradients**: Using ink-gradient for visual emphasis
- **Spinner**: For loading/progress states
- **Static**: For non-interactive content that shouldn't scroll
- **Transform**: For custom text transformations

### 2. Consistent Color Scheme

Based on VSCode theme variables and terminal colors:

- **Success**: `green` - Completed actions, success states
- **Error**: `red` - Errors, failures, warnings
- **Info**: `cyan` or `blue` - Informational messages
- **Warning**: `yellow` - Warnings, cautions
- **Muted**: `gray` with `dimColor` - Secondary information
- **Highlight**: `white` with `bold` - Primary content
- **Ask**: `yellow` - User input required
- **Say**: `green` - System messages

### 3. Icon Mapping

Use Unicode characters to represent VSCode Codicons:

| VSCode Icon             | Unicode      | Usage                |
| ----------------------- | ------------ | -------------------- |
| `codicon-error`         | `✖` or `⚠` | Errors, warnings     |
| `codicon-check`         | `✓`          | Success, completion  |
| `codicon-question`      | `?`          | Questions, followups |
| `codicon-terminal`      | `$`          | Commands             |
| `codicon-server`        | `⚙`         | MCP servers          |
| `codicon-diff`          | `±`          | Diffs, edits         |
| `codicon-edit`          | `✎`          | Edits                |
| `codicon-insert`        | `+`          | Insertions           |
| `codicon-replace`       | `⇄`          | Replacements         |
| `codicon-search`        | `🔍`         | Search operations    |
| `codicon-new-file`      | `📄`         | New files            |
| `codicon-file-code`     | `📝`         | Code files           |
| `codicon-folder-opened` | `📁`         | Directories          |
| `codicon-tasklist`      | `☐`          | Tasks                |
| `codicon-check-all`     | `✓✓`         | Complete all         |
| `codicon-play`          | `▶`         | Execute              |
| `codicon-file-media`    | `🖼`         | Images               |
| `codicon-lock`          | `🔒`         | Protected            |

### 4. Component Props Interface

All message components should accept:

```typescript
interface MessageComponentProps {
	message: ExtensionChatMessage
	// Parsed data specific to the message type
	data?: any
}
```

### 5. Error Handling

Each component should:

- Use ErrorBoundary for graceful error handling
- Provide fallback UI for missing/invalid data
- Log errors for debugging

## Message Type Categories

### ASK Messages (User Input Required)

These messages require user interaction or approval:

1. **AskToolMessage** - Tool usage requests (file operations, etc.)
2. **AskMistakeLimitMessage** - Mistake limit reached
3. **AskCommandMessage** - Command execution approval
4. **AskUseMcpServerMessage** - MCP server usage
5. **AskCompletionResultMessage** - Task completion confirmation
6. **AskFollowupMessage** - Follow-up questions with suggestions
7. **AskCondenseMessage** - Context condensation request
8. **AskPaymentRequiredMessage** - Low credit warning
9. **AskInvalidModelMessage** - Invalid model selection
10. **AskReportBugMessage** - Bug report creation
11. **AskAutoApprovalMaxReachedMessage** - Auto-approval limit

### SAY Messages (Informational)

These messages provide information to the user:

1. **SayTextMessage** - Plain text with markdown
2. **SayErrorMessage** - Error messages
3. **SayDiffErrorMessage** - Diff application errors
4. **SaySubtaskResultMessage** - Subtask results
5. **SayReasoningMessage** - AI reasoning process
6. **SayApiReqStartedMessage** - API request status
7. **SayUserFeedbackMessage** - User feedback display
8. **SayUserFeedbackDiffMessage** - User feedback with diff
9. **SayCompletionResultMessage** - Task completion result
10. **SayShellIntegrationWarningMessage** - Shell warnings
11. **SayCheckpointSavedMessage** - Checkpoint notifications
12. **SayCondenseContextMessage** - Context condensing status
13. **SayCondenseContextErrorMessage** - Condensing errors
14. **SayCodebaseSearchResultMessage** - Search results
15. **SayBrowserActionResultMessage** - Browser action results
16. **SayUserEditTodosMessage** - User todo edits
17. **SayToolMessage** - Tool execution results
18. **SayImageMessage** - Image display
19. **SayMcpServerRequestStartedMessage** - MCP request started

### TOOL Messages (Shared)

Tool components are used by both ASK and SAY messages:

1. **ToolEditedExistingFileMessage** - File edits with diff
2. **ToolInsertContentMessage** - Content insertion
3. **ToolSearchAndReplaceMessage** - Search/replace operations
4. **ToolNewFileCreatedMessage** - New file creation
5. **ToolReadFileMessage** - File reading (single/batch)
6. **ToolGenerateImageMessage** - Image generation
7. **ToolListFilesTopLevelMessage** - Top-level file listing
8. **ToolListFilesRecursiveMessage** - Recursive file listing
9. **ToolListCodeDefinitionNamesMessage** - Code definitions
10. **ToolSearchFilesMessage** - Regex file search
11. **ToolCodebaseSearchMessage** - Semantic codebase search
12. **ToolUpdateTodoListMessage** - Todo list updates
13. **ToolSwitchModeMessage** - Mode switching
14. **ToolNewTaskMessage** - New subtask creation
15. **ToolFinishTaskMessage** - Task completion
16. **ToolFetchInstructionsMessage** - Instruction fetching
17. **ToolRunSlashCommandMessage** - Slash command execution

## Implementation Strategy

### Phase 1: Foundation (Priority: High)

- Create shared types and utilities
- Implement most common message types:
    - SayTextMessage
    - SayErrorMessage
    - AskToolMessage
    - ToolReadFileMessage

### Phase 2: Core Functionality (Priority: High)

- Implement file operation tools:
    - ToolEditedExistingFileMessage
    - ToolNewFileCreatedMessage
    - ToolInsertContentMessage
    - ToolSearchAndReplaceMessage
- Implement core ask messages:
    - AskCommandMessage
    - AskFollowupMessage
    - AskCompletionResultMessage

### Phase 3: Advanced Features (Priority: Medium)

- Implement API and status messages:
    - SayApiReqStartedMessage
    - SayReasoningMessage
    - SayCompletionResultMessage
- Implement search and navigation:
    - ToolSearchFilesMessage
    - ToolCodebaseSearchMessage
    - SayCodebaseSearchResultMessage

### Phase 4: Specialized Features (Priority: Low)

- Implement KiloCode-specific messages
- Implement MCP server messages
- Implement browser action messages
- Implement checkpoint and context condensing

## Refactoring ExtensionMessageRow

The main ExtensionMessageRow component will:

1. Parse the message to determine type and subtype
2. Extract and parse JSON data if present
3. Route to the appropriate specialized component
4. Provide fallback rendering for unknown types
5. Wrap everything in ErrorBoundary

```typescript
export const ExtensionMessageRow: React.FC<Props> = ({ message }) => {
  // Parse message data
  const messageData = parseMessageData(message)

  // Route to appropriate component
  if (message.type === "ask") {
    return <AskMessageRouter message={message} data={messageData} />
  } else if (message.type === "say") {
    return <SayMessageRouter message={message} data={messageData} />
  }

  // Fallback
  return <DefaultMessage message={message} />
}
```

## Testing Strategy

Each component should have:

1. Unit tests for rendering with valid data
2. Tests for edge cases (missing data, invalid data)
3. Visual regression tests (snapshots)
4. Integration tests with ExtensionMessageRow

## Documentation

Each component file should include:

- JSDoc comments explaining purpose
- Props interface documentation
- Example usage
- Visual examples (ASCII art or screenshots)

## Future Enhancements

1. **Theming**: Support for custom color schemes
2. **Animations**: Smooth transitions for state changes
3. **Interactivity**: Keyboard shortcuts for common actions
4. **Accessibility**: Screen reader support
5. **Performance**: Virtualization for long message lists
6. **Customization**: User-configurable display preferences
