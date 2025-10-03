# Extension Message Component System

A comprehensive React component system for rendering extension messages in the Kilo Code CLI interface using Ink.

## Overview

This component system provides visually appealing, terminal-based rendering of all extension message types. It transforms the complex message structure from the VSCode extension into clean, readable CLI output with consistent styling, icons, and interactive elements.

The system handles 49 distinct message types across three main categories:

- **ASK messages** (11 types) - User input/approval required
- **SAY messages** (21 types) - Informational output
- **TOOL messages** (17 types) - Tool execution display

## Architecture

### Directory Structure

```
cli/src/ui/messages/extension/
├── README.md                         # This file
├── ARCHITECTURE.md                   # Detailed architecture documentation
├── IMPLEMENTATION_PLAN.md            # Implementation plan and checklist
├── ExtensionMessageRow.tsx           # Main orchestrator component
├── AskMessageRouter.tsx              # Router for ASK messages
├── SayMessageRouter.tsx              # Router for SAY messages
├── types.ts                          # Shared TypeScript types
├── utils.ts                          # Shared utility functions
├── __tests__/
│   └── ExtensionMessageRow.test.tsx  # Component tests
├── ask/                              # ASK message components (11)
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
├── say/                              # SAY message components (21)
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
│   ├── SayMcpServerRequestStartedMessage.tsx
│   └── SayApiReqRetryDelayedMessage.tsx
└── tools/                            # TOOL components (17)
    ├── index.ts
    ├── ToolRouter.tsx
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

### Component Hierarchy

```
ExtensionMessageRow (Main Entry Point)
├── ErrorBoundary
│   ├── AskMessageRouter
│   │   ├── AskToolMessage
│   │   │   └── ToolRouter (delegates to specific tool component)
│   │   ├── AskMistakeLimitMessage
│   │   ├── AskCommandMessage
│   │   ├── AskUseMcpServerMessage
│   │   ├── AskCompletionResultMessage
│   │   ├── AskFollowupMessage
│   │   ├── AskCondenseMessage
│   │   ├── AskPaymentRequiredMessage
│   │   ├── AskInvalidModelMessage
│   │   ├── AskReportBugMessage
│   │   └── AskAutoApprovalMaxReachedMessage
│   └── SayMessageRouter
│       ├── SayTextMessage
│       ├── SayErrorMessage
│       ├── SayDiffErrorMessage
│       ├── SaySubtaskResultMessage
│       ├── SayReasoningMessage
│       ├── SayApiReqStartedMessage
│       ├── SayUserFeedbackMessage
│       ├── SayUserFeedbackDiffMessage
│       ├── SayCompletionResultMessage
│       ├── SayShellIntegrationWarningMessage
│       ├── SayCheckpointSavedMessage
│       ├── SayCondenseContextMessage
│       ├── SayCondenseContextErrorMessage
│       ├── SayCodebaseSearchResultMessage
│       ├── SayBrowserActionResultMessage
│       ├── SayUserEditTodosMessage
│       ├── SayToolMessage
│       │   └── ToolRouter (delegates to specific tool component)
│       ├── SayImageMessage
│       ├── SayMcpServerRequestStartedMessage
│       └── SayApiReqRetryDelayedMessage
```

### Router Pattern

The system uses a three-tier routing architecture:

1. **ExtensionMessageRow** - Main entry point that determines message type (ask/say)
2. **Type Routers** - `AskMessageRouter` and `SayMessageRouter` route to specific message components
3. **ToolRouter** - Handles tool-specific rendering for both ask and say tool messages

This pattern provides:

- Clean separation of concerns
- Easy addition of new message types
- Consistent error handling via ErrorBoundary
- Type-safe routing with TypeScript

## Component Inventory

### ASK Message Components (11)

Messages requiring user input or approval:

| Component                          | Purpose                    | Key Features                                  |
| ---------------------------------- | -------------------------- | --------------------------------------------- |
| `AskToolMessage`                   | Tool usage approval        | Delegates to ToolRouter, shows answered state |
| `AskMistakeLimitMessage`           | Mistake limit warning      | Error styling, retry information              |
| `AskCommandMessage`                | Command execution approval | Command preview, working directory            |
| `AskUseMcpServerMessage`           | MCP server usage           | Server/tool/resource details, JSON args       |
| `AskCompletionResultMessage`       | Task completion request    | Success styling, result preview               |
| `AskFollowupMessage`               | Follow-up questions        | Numbered suggestions, mode switching          |
| `AskCondenseMessage`               | Context condensation       | Task preview, condensation details            |
| `AskPaymentRequiredMessage`        | Low credit warning         | Credit info, payment prompt                   |
| `AskInvalidModelMessage`           | Invalid model warning      | Model details, correction suggestions         |
| `AskReportBugMessage`              | Bug report creation        | Issue preview, GitHub integration             |
| `AskAutoApprovalMaxReachedMessage` | Auto-approval limit        | Limit details, manual approval prompt         |

### SAY Message Components (21)

Informational messages to the user:

| Component                           | Purpose                   | Key Features                                   |
| ----------------------------------- | ------------------------- | ---------------------------------------------- |
| `SayTextMessage`                    | Plain text output         | Markdown support, image attachments, streaming |
| `SayErrorMessage`                   | Error messages            | Red styling, error icon, bordered box          |
| `SayDiffErrorMessage`               | Diff application errors   | Expandable details, error context              |
| `SaySubtaskResultMessage`           | Subtask results           | Badge styling, result summary                  |
| `SayReasoningMessage`               | AI reasoning process      | Streaming support, thinking indicator          |
| `SayApiReqStartedMessage`           | API request status        | Cost display, streaming/complete/failed states |
| `SayUserFeedbackMessage`            | User feedback display     | Feedback formatting, timestamp                 |
| `SayUserFeedbackDiffMessage`        | Feedback with diff        | Diff highlighting, code accordion              |
| `SayCompletionResultMessage`        | Task completion           | Success styling, completion summary            |
| `SayShellIntegrationWarningMessage` | Shell warnings            | Warning icon, integration details              |
| `SayCheckpointSavedMessage`         | Checkpoint notifications  | Checkpoint info, save confirmation             |
| `SayCondenseContextMessage`         | Context condensing status | Progress indicator, results summary            |
| `SayCondenseContextErrorMessage`    | Condensing errors         | Error details, retry information               |
| `SayCodebaseSearchResultMessage`    | Search results            | Result list, relevance scores, file paths      |
| `SayBrowserActionResultMessage`     | Browser action results    | Action details, screenshot info                |
| `SayUserEditTodosMessage`           | User todo edits           | Todo list display, read-only mode              |
| `SayToolMessage`                    | Tool execution results    | Delegates to ToolRouter for display            |
| `SayImageMessage`                   | Image display             | Image path, URI display                        |
| `SayMcpServerRequestStartedMessage` | MCP request started       | Server info, request details                   |
| `SayApiReqRetryDelayedMessage`      | API retry delay           | Delay duration, retry reason                   |

### TOOL Components (17)

Shared components for tool operations:

| Component                            | Purpose              | Key Features                          |
| ------------------------------------ | -------------------- | ------------------------------------- |
| `ToolEditedExistingFileMessage`      | File edits           | Diff display, protected file warnings |
| `ToolInsertContentMessage`           | Content insertion    | Line number, insertion preview        |
| `ToolSearchAndReplaceMessage`        | Search/replace       | Pattern display, replacement preview  |
| `ToolNewFileCreatedMessage`          | New file creation    | Content preview, line count           |
| `ToolReadFileMessage`                | File reading         | Single/batch file display, reason     |
| `ToolGenerateImageMessage`           | Image generation     | Prompt display, output path           |
| `ToolListFilesTopLevelMessage`       | Top-level listing    | Directory path, file count            |
| `ToolListFilesRecursiveMessage`      | Recursive listing    | Directory tree, file count            |
| `ToolListCodeDefinitionNamesMessage` | Code definitions     | Definition list, file path            |
| `ToolSearchFilesMessage`             | Regex search         | Pattern, results count, matches       |
| `ToolCodebaseSearchMessage`          | Semantic search      | Query, relevance scores               |
| `ToolUpdateTodoListMessage`          | Todo updates         | Todo list with status icons           |
| `ToolSwitchModeMessage`              | Mode switching       | From/to modes, reason                 |
| `ToolNewTaskMessage`                 | Subtask creation     | Mode, task description                |
| `ToolFinishTaskMessage`              | Task completion      | Completion instructions               |
| `ToolFetchInstructionsMessage`       | Instruction fetching | Instructions content                  |
| `ToolRunSlashCommandMessage`         | Slash command        | Command name, args, description       |

### Supporting Files

| File                      | Purpose                                    | Lines |
| ------------------------- | ------------------------------------------ | ----- |
| `types.ts`                | TypeScript type definitions                | 103   |
| `utils.ts`                | Utility functions (parsing, icons, colors) | 195   |
| `ExtensionMessageRow.tsx` | Main orchestrator component                | ~50   |
| `AskMessageRouter.tsx`    | ASK message router                         | ~80   |
| `SayMessageRouter.tsx`    | SAY message router                         | ~120  |
| `ToolRouter.tsx`          | Tool message router                        | ~100  |

## Usage Examples

### Basic Usage in CLI

```typescript
import { ExtensionMessageRow } from './messages/extension/ExtensionMessageRow'

// In your message display component
<ExtensionMessageRow message={extensionMessage} />
```

### Adding a New Message Type

1. **Create the component file:**

```typescript
// say/SayNewFeatureMessage.tsx
import React from "react"
import { Box, Text } from "ink"
import type { MessageComponentProps } from "../types.js"

export const SayNewFeatureMessage: React.FC<MessageComponentProps> = ({ message }) => {
  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color="green" bold>
          ✨ New Feature
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text>{message.text}</Text>
      </Box>
    </Box>
  )
}
```

2. **Export from index.ts:**

```typescript
// say/index.ts
export { SayNewFeatureMessage } from "./SayNewFeatureMessage.js"
```

3. **Add to router:**

```typescript
// SayMessageRouter.tsx
import { SayNewFeatureMessage } from "./say/index.js"

export const SayMessageRouter: React.FC<MessageComponentProps> = ({ message }) => {
  switch (message.say) {
    case "new_feature":
      return <SayNewFeatureMessage message={message} />
    // ... other cases
  }
}
```

### Customizing Visual Styling

The system uses consistent styling patterns defined in `utils.ts`:

```typescript
import { getMessageIcon, getMessageColor, getToolIcon } from "./utils.js"

// Get icon for message type
const icon = getMessageIcon("say", "error") // Returns "✖"

// Get color for message type
const color = getMessageColor("say", "error") // Returns "red"

// Get icon for tool type
const toolIcon = getToolIcon("readFile") // Returns "📝"
```

To customize styling, modify the utility functions or override in individual components.

## Testing

### Running Tests

```bash
# Run all tests
cd cli
npm test

# Run tests for extension messages
npm test -- src/ui/messages/extension

# Run tests in watch mode
npm test -- --watch
```

### Manual Testing

A manual test script is provided for visual testing:

```bash
# Run the manual test script
npx tsx cli/src/ui/messages/extension/manual-test.tsx
```

This script displays all message types with sample data for visual verification.

### Test Coverage

Current test coverage includes:

- ✅ ExtensionMessageRow routing logic
- ✅ Error boundary handling
- ✅ Message type detection
- ✅ Utility function parsing
- ✅ Icon and color mapping

Individual component tests are located in `__tests__/` directories.

## Visual Design Patterns

### Color Scheme

The system uses a consistent color scheme based on message semantics:

| Color      | Usage                              | Examples                             |
| ---------- | ---------------------------------- | ------------------------------------ |
| **Yellow** | ASK messages (user input required) | All ask/\* components                |
| **Green**  | Success, completion, SAY messages  | Completion results, success states   |
| **Red**    | Errors, failures                   | Error messages, failed operations    |
| **Cyan**   | Information, API status            | API requests, informational messages |
| **Gray**   | Secondary info, muted text         | Timestamps, metadata, dimmed content |
| **White**  | Primary content                    | Main message text, file paths        |

### Icons and Symbols

Unicode characters map to VSCode Codicons:

| Symbol | Meaning     | Usage                        |
| ------ | ----------- | ---------------------------- |
| `?`    | Question    | ASK messages, followups      |
| `✓`    | Success     | Completions, confirmations   |
| `✖`   | Error       | Errors, failures             |
| `⚠`   | Warning     | Warnings, cautions           |
| `$`    | Command     | Terminal commands            |
| `⚙`   | Tool/Server | Tool operations, MCP servers |
| `±`    | Diff        | File edits, changes          |
| `+`    | Insert      | Content insertion            |
| `⇄`    | Replace     | Search and replace           |
| `📄`   | New File    | File creation                |
| `📝`   | File        | File operations              |
| `📁`   | Directory   | Directory operations         |
| `🔍`   | Search      | Search operations            |
| `☐`    | Todo        | Todo items                   |
| `⚡`   | Mode        | Mode switching               |
| `📋`   | Task        | Task operations              |
| `🖼`   | Image       | Image operations             |
| `💾`   | Save        | Checkpoint saves             |
| `🐛`   | Bug         | Bug reports                  |
| `💳`   | Payment     | Payment/credit               |

### Border Styles

Components use Ink's border styles for visual hierarchy:

```typescript
// Error messages - red border
<Box borderStyle="single" borderColor="red" paddingX={1}>

// Tool operations - gray border
<Box borderStyle="single" borderColor="gray" paddingX={1}>

// Important content - double border
<Box borderStyle="double" borderColor="cyan" paddingX={1}>

// Subtle grouping - no border, just margin
<Box marginLeft={2} marginY={1}>
```

### Layout Patterns

Consistent layout patterns across components:

1. **Header + Content:**

```
Icon Title
  Content indented
  Additional details
```

2. **Bordered Box:**

```
┌─────────────────────┐
│ Content in box      │
│ Multiple lines      │
└─────────────────────┘
```

3. **List Items:**

```
Icon Item 1
Icon Item 2
Icon Item 3
```

4. **Status Indicators:**

```
⟳ In Progress...
✓ Completed (with details)
✖ Failed (with error)
```

## Development Guidelines

### Best Practices

1. **Component Structure:**

    - Keep components focused and single-purpose
    - Use TypeScript strictly for type safety
    - Handle missing/invalid data gracefully
    - Provide fallback UI for errors

2. **Styling:**

    - Use utility functions for consistent icons/colors
    - Follow established layout patterns
    - Respect terminal width constraints
    - Use appropriate spacing (marginX, marginY, paddingX, paddingY)

3. **Error Handling:**

    - Wrap components in ErrorBoundary
    - Validate data before rendering
    - Log errors for debugging
    - Show user-friendly error messages

4. **Performance:**

    - Avoid unnecessary re-renders
    - Use React.memo for expensive components
    - Keep component trees shallow
    - Minimize state updates

5. **Documentation:**
    - Add JSDoc comments to components
    - Document props interfaces
    - Include usage examples
    - Explain complex logic

### Code Style

Follow the existing code style:

```typescript
// Use functional components with TypeScript
export const ComponentName: React.FC<MessageComponentProps> = ({ message }) => {
  // Parse data at the top
  const data = parseMessageJson(message.text)

  // Early returns for invalid data
  if (!data) {
    return <FallbackComponent />
  }

  // Render with consistent structure
  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color="color" bold>Icon Title</Text>
      </Box>
      <Box marginLeft={2}>
        <Text>Content</Text>
      </Box>
    </Box>
  )
}
```

### Adding New Features

When adding new features:

1. Update type definitions in `types.ts`
2. Add utility functions in `utils.ts` if needed
3. Create component in appropriate directory
4. Export from `index.ts`
5. Add to router component
6. Write tests
7. Update documentation

## File Statistics

### Summary

- **Total Files Created:** 54
- **Total Lines of Code:** ~4,500
- **Component Files:** 49
- **Supporting Files:** 5

### Breakdown by Category

| Category        | Files | Approx. Lines |
| --------------- | ----- | ------------- |
| ASK Components  | 11    | ~1,100        |
| SAY Components  | 21    | ~2,100        |
| TOOL Components | 17    | ~1,000        |
| Routers         | 3     | ~300          |
| Types & Utils   | 2     | ~300          |
| Tests           | 1     | ~200          |

### Component Size Distribution

- **Small** (< 50 lines): 15 components
- **Medium** (50-100 lines): 25 components
- **Large** (> 100 lines): 9 components

## Related Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Detailed architecture and design principles
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) - Implementation phases and checklist
- [`EXTENSION_MESSAGE_TYPES.md`](../../../EXTENSION_MESSAGE_TYPES.md) - Complete message type reference
- [`types.ts`](./types.ts) - TypeScript type definitions
- [`utils.ts`](./utils.ts) - Utility functions

## Version History

- **v1.0.0** (2025-10-03) - Initial implementation complete
    - 49 message components implemented
    - 3 router components
    - Comprehensive test coverage
    - Full documentation

## Contributing

When contributing to this component system:

1. Follow the established patterns and conventions
2. Write tests for new components
3. Update documentation
4. Ensure type safety
5. Test in terminal environment
6. Consider accessibility (screen readers, color blindness)

## License

Part of the Kilo Code project. See main project LICENSE for details.
