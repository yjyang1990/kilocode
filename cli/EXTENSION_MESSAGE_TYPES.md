# Extension Message Types Reference

This document tracks all extension message types available in the webview-ui ChatRow component that need to be supported in the CLI.

**Source:** `webview-ui/src/components/chat/ChatRow.tsx`

---

## Message Structure

Messages have a base structure with a `type` field that can be either `"ask"` or `"say"`, and then a corresponding subtype field:

```typescript
interface ClineMessage {
	type: "ask" | "say"
	ask?: string // When type is "ask"
	say?: string // When type is "say"
	text?: string
	ts: number
	partial?: boolean
	images?: any[]
	metadata?: any
	progressStatus?: string
	checkpoint?: any
	contextCondense?: any
}
```

---

## 1. ASK Message Types

These are messages where the extension is asking for user input or permission.

### 1.1 `ask: "tool"`

Tool usage requests that require user approval. The `text` field contains a JSON-encoded [`ClineSayTool`](#3-tool-types) object.

**Tool Types:**

- `editedExistingFile` / `appliedDiff` - Edit existing files
- `insertContent` - Insert content at specific line
- `searchAndReplace` - Search and replace operations
- `codebaseSearch` - Search codebase
- `updateTodoList` - Update todo list
- `newFileCreated` - Create new file
- `readFile` - Read file(s)
- `fetchInstructions` - Fetch instructions
- `listFilesTopLevel` - List files (top level)
- `listFilesRecursive` - List files (recursive)
- `listCodeDefinitionNames` - List code definitions
- `searchFiles` - Search files with regex
- `switchMode` - Switch to different mode
- `newTask` - Create new subtask
- `finishTask` - Finish current task
- `runSlashCommand` - Run slash command
- `generateImage` - Generate image

### 1.2 `ask: "mistake_limit_reached"`

Indicates that the mistake limit has been reached.

**Display:** Error message with icon

### 1.3 `ask: "command"`

Request to execute a command in the terminal.

**Display:** Command execution UI with approval buttons
**Related:** [`CommandExecution`](webview-ui/src/components/chat/CommandExecution.tsx) component

### 1.4 `ask: "use_mcp_server"`

Request to use an MCP (Model Context Protocol) server tool or resource.

**Text Format:** JSON-encoded [`ClineAskUseMcpServer`](#clineaskusemcpserver) object

**Subtypes:**

- `type: "use_mcp_tool"` - Use MCP tool
- `type: "access_mcp_resource"` - Access MCP resource

### 1.5 `ask: "completion_result"`

Task completion request (with optional text).

**Display:** Success message with green color

### 1.6 `ask: "followup"`

Follow-up question with suggested answers.

**Text Format:** JSON-encoded [`FollowUpData`](#followupdata) object

**Display:** Question with clickable suggestions

### 1.7 `ask: "condense"` _(KiloCode-specific)_

Request to condense/summarize context into a new task.

**Display:** New task preview UI

### 1.8 `ask: "payment_required_prompt"` _(KiloCode-specific)_

Low credit warning prompt.

**Display:** [`LowCreditWarning`](webview-ui/src/components/kilocode/chat/LowCreditWarning.tsx) component

### 1.9 `ask: "invalid_model"` _(KiloCode-specific)_

Invalid model selection warning.

**Display:** [`InvalidModelWarning`](webview-ui/src/components/kilocode/chat/InvalidModelWarning.tsx) component

### 1.10 `ask: "report_bug"` _(KiloCode-specific)_

Request to create a GitHub issue for bug reporting.

**Display:** Bug report preview UI

### 1.11 `ask: "auto_approval_max_req_reached"`

Auto-approval request limit reached warning.

**Display:** [`AutoApprovedRequestLimitWarning`](webview-ui/src/components/chat/AutoApprovedRequestLimitWarning.tsx) component

### 1.12 `ask: "api_req_failed"`

API request failed (referenced in code but not directly rendered).

---

## 2. SAY Message Types

These are informational messages from the extension to the user.

### 2.1 `say: "text"`

Plain text message with optional markdown formatting.

**Display:** Markdown-rendered text
**May include:** Images array

### 2.2 `say: "error"`

Error message.

**Display:** Red error text with error icon

### 2.3 `say: "diff_error"`

Diff application error with expandable details.

**Display:** Warning icon with expandable error details
**Features:** Copy button for error text

### 2.4 `say: "subtask_result"`

Result from a completed subtask.

**Display:** Badge-styled result box with markdown content

### 2.5 `say: "reasoning"`

AI reasoning/thinking process (for models that support it).

**Display:** [`ReasoningBlock`](webview-ui/src/components/chat/ReasoningBlock.tsx) component
**Features:** Streaming support

### 2.6 `say: "api_req_started"`

API request started/in-progress indicator.

**Text Format:** JSON-encoded [`ClineApiReqInfo`](#clineapireqinfo) object

**States:**

- Streaming (in progress)
- Completed (with cost)
- Failed (with error message)
- Cancelled (user cancelled or streaming failed)

**Display:** Progress indicator or status icon with cost badge

### 2.7 `say: "api_req_finished"`

API request finished (not rendered, handled internally).

### 2.8 `say: "api_req_retry_delayed"`

API request retry delayed (returns empty array for icon/title).

### 2.9 `say: "user_feedback"`

User feedback message.

**Display:** [`KiloChatRowUserFeedback`](webview-ui/src/components/kilocode/chat/KiloChatRowUserFeedback.tsx) component _(KiloCode-specific)_

### 2.10 `say: "user_feedback_diff"`

User feedback with diff content.

**Text Format:** JSON-encoded [`ClineSayTool`](#3-tool-types) object with diff

**Display:** Code accordion with diff highlighting

### 2.11 `say: "completion_result"`

Task completion result message.

**Display:** Success message with green color
**KiloCode Feature:** "See New Changes" button if commit range available

### 2.12 `say: "shell_integration_warning"`

Shell integration warning.

**Display:** [`CommandExecutionError`](webview-ui/src/components/chat/CommandExecutionError.tsx) component

### 2.13 `say: "checkpoint_saved"`

Checkpoint saved notification.

**Display:** [`CheckpointSaved`](webview-ui/src/components/chat/checkpoints/CheckpointSaved.tsx) component

### 2.14 `say: "condense_context"`

Context condensing status.

**States:**

- `partial: true` - Condensing in progress
- `partial: false` - Condensing complete with results

**Display:**

- [`CondensingContextRow`](webview-ui/src/components/chat/ContextCondenseRow.tsx) (in progress)
- [`ContextCondenseRow`](webview-ui/src/components/chat/ContextCondenseRow.tsx) (complete)

### 2.15 `say: "condense_context_error"`

Context condensing error.

**Display:** [`CondenseContextErrorRow`](webview-ui/src/components/chat/ContextCondenseRow.tsx) component

### 2.16 `say: "codebase_search_result"`

Codebase search results.

**Text Format:** JSON with search results array

**Display:** [`CodebaseSearchResultsDisplay`](webview-ui/src/components/chat/CodebaseSearchResultsDisplay.tsx) component

### 2.17 `say: "browser_action_result"` _(Upstream PR)_

Browser action result (should be grouped into browser sessions).

**Note:** If rendered here, indicates a bug in message grouping logic

### 2.18 `say: "user_edit_todos"`

User manually edited todos.

**Display:** [`UpdateTodoListToolBlock`](webview-ui/src/components/chat/UpdateTodoListToolBlock.tsx) in read-only mode

### 2.19 `say: "tool"`

Tool execution result (as opposed to `ask: "tool"` which is a request).

**Text Format:** JSON-encoded [`ClineSayTool`](#3-tool-types) object

**Currently Supported:**

- `runSlashCommand` - Slash command execution result

### 2.20 `say: "image"`

Image display message.

**Text Format:** JSON with `imageUri` and `imagePath`

**Display:** [`ImageBlock`](webview-ui/src/components/common/ImageBlock.tsx) component

### 2.21 `say: "mcp_server_request_started"`

MCP server request started (referenced in code for progress indicator).

---

## 3. Tool Types

Tools are used in both `ask: "tool"` and `say: "tool"` messages. The tool type is specified in the `tool` field of the [`ClineSayTool`](#clinesaytool) object.

### File Operations

#### 3.1 `editedExistingFile` / `appliedDiff`

Edit existing file with diff.

**Fields:**

- `path: string` - File path
- `content?: string` - Full content (for editedExistingFile)
- `diff?: string` - Diff content
- `isProtected?: boolean` - Protected file flag
- `isOutsideWorkspace?: boolean` - Outside workspace flag
- `batchDiffs?: Array` - Batch diff operations
- `fastApplyResult?: any` - Fast apply result _(KiloCode)_

**Display:** Code accordion with diff highlighting

#### 3.2 `insertContent`

Insert content at specific line number.

**Fields:**

- `path: string` - File path
- `diff: string` - Diff showing insertion
- `lineNumber: number` - Line number (0 = end of file)
- `isProtected?: boolean`
- `isOutsideWorkspace?: boolean`

#### 3.3 `searchAndReplace`

Search and replace in file.

**Fields:**

- `path: string` - File path
- `diff: string` - Diff showing changes
- `isProtected?: boolean`

#### 3.4 `newFileCreated`

Create new file.

**Fields:**

- `path: string` - File path
- `content: string` - File content
- `isProtected?: boolean`
- `fastApplyResult?: any` - Fast apply result _(KiloCode)_

**Features:** Jump to file button

#### 3.5 `readFile`

Read file(s).

**Fields:**

- `path: string` - File path
- `content: string` - File path (used for opening)
- `reason?: string` - Reason for reading
- `isOutsideWorkspace?: boolean`
- `additionalFileCount?: number` - Additional files count
- `batchFiles?: Array` - Batch file operations

**Display:**

- Single file: Clickable file path
- Batch: [`BatchFilePermission`](webview-ui/src/components/chat/BatchFilePermission.tsx) component

#### 3.6 `generateImage`

Generate image with AI.

**Fields:**

- `path: string` - Output path
- `content: string` - Image prompt
- `isProtected?: boolean`
- `isOutsideWorkspace?: boolean`

### Directory Operations

#### 3.7 `listFilesTopLevel`

List files at top level of directory.

**Fields:**

- `path: string` - Directory path
- `content: string` - File listing
- `isOutsideWorkspace?: boolean`

#### 3.8 `listFilesRecursive`

List files recursively in directory.

**Fields:**

- `path: string` - Directory path
- `content: string` - File listing
- `isOutsideWorkspace?: boolean`

#### 3.9 `listCodeDefinitionNames`

List code definitions (classes, functions, etc.).

**Fields:**

- `path: string` - File/directory path
- `content: string` - Definitions listing
- `isOutsideWorkspace?: boolean`

#### 3.10 `searchFiles`

Search files with regex.

**Fields:**

- `path: string` - Directory path
- `content: string` - Search results
- `regex: string` - Search pattern
- `filePattern?: string` - File pattern filter
- `isOutsideWorkspace?: boolean`

### Search Operations

#### 3.11 `codebaseSearch`

Search codebase semantically.

**Fields:**

- `query: string` - Search query
- `path?: string` - Optional path restriction

### Task Management

#### 3.12 `updateTodoList`

Update todo list.

**Fields:**

- `todos: Array` - Todo items
- `content?: string` - Additional content

**Display:** [`UpdateTodoListToolBlock`](webview-ui/src/components/chat/UpdateTodoListToolBlock.tsx) component

#### 3.13 `switchMode`

Switch to different mode.

**Fields:**

- `mode: string` - Target mode slug
- `reason?: string` - Reason for switching

#### 3.14 `newTask`

Create new subtask.

**Fields:**

- `mode: string` - Mode for subtask
- `content: string` - Task description

#### 3.15 `finishTask`

Finish current task.

**Display:** Completion instructions

### Other Operations

#### 3.16 `fetchInstructions`

Fetch instructions for a task.

**Fields:**

- `content: string` - Instructions content

**Display:** Code accordion with markdown

#### 3.17 `runSlashCommand`

Run slash command.

**Fields:**

- `command: string` - Command name
- `args?: string` - Command arguments
- `description?: string` - Command description
- `source?: string` - Command source

**Display:** Expandable command info block

---

## 4. Type Definitions

### ClineApiReqInfo

```typescript
interface ClineApiReqInfo {
	cost?: number
	usageMissing?: boolean
	cancelReason?: "user_cancelled" | string
	streamingFailedMessage?: string
	request?: string
}
```

### ClineAskUseMcpServer

```typescript
interface ClineAskUseMcpServer {
	type: "use_mcp_tool" | "access_mcp_resource"
	serverName: string
	toolName?: string // For use_mcp_tool
	arguments?: string // For use_mcp_tool (JSON string)
	uri?: string // For access_mcp_resource
	response?: any // Response data
}
```

### FollowUpData

```typescript
interface FollowUpData {
	question: string
	suggest?: Array<SuggestionItem>
}

interface SuggestionItem {
	text: string
	mode?: string // Optional mode to switch to
}
```

### ClineSayTool

```typescript
interface ClineSayTool {
	tool: string // One of the tool types listed above
	path?: string
	content?: string
	diff?: string
	// ... other fields specific to each tool type
}
```

---

## 5. Icon Mapping

Messages display with specific VSCode Codicons:

| Message Type                  | Icon               | Color             |
| ----------------------------- | ------------------ | ----------------- |
| `error`                       | `codicon-error`    | Error foreground  |
| `mistake_limit_reached`       | `codicon-error`    | Error foreground  |
| `command`                     | `codicon-terminal` | Normal foreground |
| `use_mcp_server`              | `codicon-server`   | Normal foreground |
| `completion_result`           | `codicon-check`    | Success green     |
| `followup`                    | `codicon-question` | Normal foreground |
| `api_req_started` (success)   | `codicon-check`    | Success green     |
| `api_req_started` (failed)    | `codicon-error`    | Error foreground  |
| `api_req_started` (cancelled) | `codicon-error`    | Cancelled grey    |
| `api_req_started` (streaming) | Progress spinner   | -                 |

### Tool Icons

| Tool Type                                  | Icon                                           |
| ------------------------------------------ | ---------------------------------------------- |
| `editedExistingFile` / `appliedDiff`       | `codicon-diff` or `codicon-edit`               |
| `insertContent`                            | `codicon-insert`                               |
| `searchAndReplace`                         | `codicon-replace`                              |
| `codebaseSearch`                           | `codicon-search`                               |
| `newFileCreated`                           | `codicon-new-file`                             |
| `readFile`                                 | `codicon-file-code` or `codicon-files` (batch) |
| `fetchInstructions`                        | `codicon-file-code`                            |
| `listFilesTopLevel` / `listFilesRecursive` | `codicon-folder-opened`                        |
| `listCodeDefinitionNames`                  | `codicon-file-code`                            |
| `searchFiles`                              | `codicon-search`                               |
| `switchMode`                               | `codicon-symbol-enum`                          |
| `newTask`                                  | `codicon-tasklist`                             |
| `finishTask`                               | `codicon-check-all`                            |
| `runSlashCommand`                          | `codicon-play` or `codicon-terminal-cmd`       |
| `generateImage`                            | `codicon-file-media`                           |
| Protected file                             | `codicon-lock` (warning color)                 |

---

## 6. Special Features

### Batch Operations

Some tools support batch operations:

- **Batch File Read:** `readFile` with `batchFiles` array
- **Batch Diff Apply:** `appliedDiff` with `batchDiffs` array

These display special approval UIs:

- [`BatchFilePermission`](webview-ui/src/components/chat/BatchFilePermission.tsx)
- [`BatchDiffApproval`](webview-ui/src/components/chat/BatchDiffApproval.tsx)

### KiloCode-Specific Features

Messages marked with _(KiloCode-specific)_ are custom additions:

1. **Fast Apply:** `fastApplyResult` field in file operations
2. **Commit Tracking:** `commitRange` in completion results
3. **User Feedback:** Enhanced feedback UI
4. **Payment/Credit:** Low credit warnings
5. **Bug Reporting:** GitHub issue creation
6. **Task Condensing:** Context summarization

### Progress Tracking

Some messages support progress status:

- `progressStatus` field indicates operation progress
- Used in file operations to show real-time status

### Streaming Support

Messages can be partial (streaming):

- `partial: true` - Message is still being streamed
- `partial: false` or undefined - Message is complete

---

## 7. CLI Implementation Notes

When implementing CLI support, consider:

1. **Interactive Prompts:** Convert approval requests to CLI prompts
2. **Progress Indicators:** Use CLI-appropriate progress displays
3. **Batch Operations:** Handle batch approvals efficiently
4. **File Display:** Show file paths and diffs in terminal-friendly format
5. **Icons:** Map VSCode icons to Unicode/ASCII equivalents
6. **Colors:** Use ANSI colors for terminal output
7. **Streaming:** Handle partial messages appropriately
8. **MCP Integration:** Ensure MCP server communication works in CLI context

### Priority Message Types for CLI

**High Priority:**

- `ask: "tool"` - All file operations
- `ask: "command"` - Command execution
- `ask: "followup"` - User questions
- `say: "text"` - Basic text output
- `say: "error"` - Error messages
- `say: "api_req_started"` - API status

**Medium Priority:**

- `ask: "completion_result"` - Task completion
- `say: "completion_result"` - Task results
- `ask: "use_mcp_server"` - MCP operations
- Tool types: file operations, directory operations

**Low Priority:**

- KiloCode-specific features
- Advanced UI features (checkpoints, condensing, etc.)

---

## 8. Message Flow Examples

### File Edit Flow

1. `ask: "tool"` with `tool: "appliedDiff"` - Request to edit file
2. User approves
3. `say: "tool"` with `tool: "appliedDiff"` - Confirmation of edit (optional)

### Command Execution Flow

1. `ask: "command"` - Request to run command
2. User approves
3. Command output streamed
4. Command completion

### API Request Flow

1. `say: "api_req_started"` with `partial: true` - Request started
2. `say: "api_req_started"` with cost - Request completed
3. OR `say: "api_req_started"` with error - Request failed

### Task Completion Flow

1. `ask: "completion_result"` - Request to complete task
2. User approves
3. `say: "completion_result"` - Task completion message

---

## Version Information

- **Document Created:** 2025-10-03
- **Source File:** `webview-ui/src/components/chat/ChatRow.tsx`
- **Lines Analyzed:** 1-1582

---

## Related Files

- [`@roo-code/types`](../../packages/types/) - Type definitions
- [`@roo/ExtensionMessage`](../../src/shared/ExtensionMessage.ts) - Message types
- [`webview-ui/src/components/chat/`](../../webview-ui/src/components/chat/) - Chat components
- [`webview-ui/src/components/kilocode/chat/`](../../webview-ui/src/components/kilocode/chat/) - KiloCode chat components
