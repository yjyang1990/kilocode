# Message Completion Rules

This document defines the rules for determining when messages are "complete" and can be moved to the static rendering section.

## Overview

Messages are split into two categories:

1. **Static Messages**: Complete messages that won't change (rendered once with Ink Static)
2. **Dynamic Messages**: Incomplete or updating messages (re-rendered as needed)

## Completion Rules by Message Type

### CLI Messages

**Rule**: Complete when `partial !== true`

```typescript
// Complete
{ id: "1", type: "user", content: "Hello", ts: 123 }
{ id: "2", type: "user", content: "Hello", ts: 123, partial: false }

// Incomplete
{ id: "3", type: "user", content: "Hel...", ts: 123, partial: true }
```

### Extension Say Messages

#### General Say Messages

**Rule**: Complete when `partial !== true`

```typescript
// Complete
{ ts: 123, type: "say", say: "text", text: "Hello" }
{ ts: 123, type: "say", say: "error", text: "Error", partial: false }

// Incomplete
{ ts: 123, type: "say", say: "text", text: "Hel...", partial: true }
```

#### api_req_started Messages

**Rule**: Complete when it has ONE of:

- `cost` defined (successful completion)
- `streamingFailedMessage` (error occurred)
- `cancelReason` (request was cancelled)

```typescript
// Complete
{ ts: 123, type: "say", say: "api_req_started", text: '{"cost": 0.001}' }
{ ts: 123, type: "say", say: "api_req_started", text: '{"streamingFailedMessage": "Error"}' }
{ ts: 123, type: "say", say: "api_req_started", text: '{"cancelReason": "user_cancelled"}' }

// Incomplete
{ ts: 123, type: "say", say: "api_req_started", text: '{}', partial: false }
```

**Why**: API requests go through multiple states:

1. Started (incomplete) - shows "⟳ API Request in progress..."
2. Completed (complete) - shows "✓ API Request - Cost: $X"
3. Failed (complete) - shows "✖ API Request failed"
4. Cancelled (complete) - shows "⚠ API Request cancelled"

### Extension Ask Messages

#### Non-Rendering Ask Types

**Rule**: Immediately complete (don't wait for `isAnswered`)

**Types**: `completion_result`, `command_output`

```typescript
// Complete (even without isAnswered)
{ ts: 123, type: "ask", ask: "completion_result", text: "" }
{ ts: 123, type: "ask", ask: "command_output", text: "" }
```

**Why**: These message types return `null` in the router (don't render), so there's no point waiting for them to be answered.

#### Interactive Ask Types

**Rule**: Complete when `isAnswered === true`

**Types**: `tool`, `command`, `followup`, `use_mcp_server`, `browser_action_launch`, etc.

```typescript
// Complete
{ ts: 123, type: "ask", ask: "tool", text: '{"tool":"readFile"}', isAnswered: true }

// Incomplete (waiting for user response)
{ ts: 123, type: "ask", ask: "tool", text: '{"tool":"readFile"}' }
{ ts: 123, type: "ask", ask: "followup", text: "Question?", isAnswered: false }
```

**Why**: These messages require user interaction (approval/rejection or answer), so they must wait until answered.

## Sequential Completion Rule

**Critical Rule**: A message can only be marked as static if ALL previous messages are also complete.

### Example 1: Sequential Completion

```
Message 1: Complete ✓ → Static
Message 2: Complete ✓ → Static
Message 3: Complete ✓ → Static
```

Result: All 3 messages in static section

### Example 2: Gap in Completion

```
Message 1: Complete ✓ → Static
Message 2: Incomplete ✗ → Dynamic
Message 3: Complete ✓ → Dynamic (blocked by #2)
Message 4: Complete ✓ → Dynamic (blocked by #2)
```

Result: 1 message in static, 3 in dynamic

**Why**: This prevents:

- Mixed ordering in the static section
- Partial messages appearing before completed ones
- Visual jumping when messages complete out of order

## Deduplication Rules

### Checkpoint Messages

**Rule**: Deduplicate `checkpoint_saved` messages with identical hashes

```typescript
// Before deduplication
[
  { ts: 1, type: "say", say: "checkpoint_saved", text: "abc123" },
  { ts: 2, type: "say", say: "text", text: "Some text" },
  { ts: 3, type: "say", say: "checkpoint_saved", text: "abc123" }, // Duplicate!
]

// After deduplication
[
  { ts: 1, type: "say", say: "checkpoint_saved", text: "abc123" },
  { ts: 2, type: "say", say: "text", text: "Some text" },
  // Message 3 removed
]
```

**Why**: The extension can create multiple task instances that save identical checkpoints, resulting in duplicate "Checkpoint Saved" messages.

## Common Scenarios

### Scenario 1: Normal Message Flow

```
1. User message (CLI) → Complete immediately
2. API request started → Incomplete (waiting for cost/error/cancel)
3. Text response → Incomplete (partial=true, streaming)
4. Text response → Complete (partial=false, streaming done)
5. API request started → Complete (cost received)
6. Completion result → Complete immediately
```

### Scenario 2: Tool Approval Flow

```
1. User message (CLI) → Complete immediately
2. API request started → Incomplete
3. Tool request (ask) → Incomplete (waiting for approval)
   [User approves]
4. Tool request (ask) → Complete (isAnswered=true)
5. Tool result (say) → Complete
6. API request started → Complete (cost received)
```

### Scenario 3: Followup Question Flow

```
1. User message (CLI) → Complete immediately
2. API request started → Incomplete
3. Followup question (ask) → Incomplete (waiting for answer)
   [User answers]
4. Followup question (ask) → Complete (isAnswered=true)
5. User feedback (say) → Complete
6. API request started → Complete (cost received)
```

## Implementation Notes

### Why Some Messages Stay Dynamic

If you see messages staying in the dynamic section, it's usually because:

1. **Tool/Command/Followup messages**: Waiting for user approval/answer
    - This is correct behavior - they should stay dynamic until answered
2. **API request messages**: Waiting for completion indicators
    - Should receive cost/error/cancel when API call finishes
3. **Partial messages**: Still streaming content

    - Will complete when `partial` flag is removed

4. **Sequential blocking**: A previous message is incomplete
    - Later messages can't become static until earlier ones complete

### Performance Impact

- **Static messages**: Rendered once, never re-render (optimal performance)
- **Dynamic messages**: Re-render on every state update (necessary for updates)

The goal is to move as many messages as possible to the static section while maintaining correctness.
