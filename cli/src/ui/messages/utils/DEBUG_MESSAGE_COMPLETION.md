# Message Completion Debug Guide

This document explains how to debug message completion issues using the built-in logging.

## Overview

The message completion system determines which messages are "complete" and can be rendered statically (without re-rendering), and which messages are still "dynamic" (need to continue updating).

## Debug Logging

The system includes comprehensive debug logging to help diagnose completion issues. All logs are under the `messageCompletion` category.

### Enabling Debug Logs

To see the debug logs, you need to enable debug level logging. This can be done by:

1. Setting the log level in your environment
2. Using the CLI with debug flags (if available)
3. Checking the logs output during runtime

### Log Types

#### 1. CLI Message Completion Check

```
CLI message completion check
{
  id: "message-id",
  type: "user" | "assistant" | "system" | "error",
  partial: true | false | undefined,
  isComplete: true | false
}
```

**What it means:**

- Shows each CLI message being checked
- `partial: true` means the message is still being written
- `isComplete: false` means it will be in the dynamic section

#### 2. Extension Message - Partial Check

```
Extension message incomplete: partial=true
{
  ts: 1234567890,
  type: "say" | "ask",
  say: "text" | "error" | etc.,
  ask: "followup" | "tool" | etc.
}
```

**What it means:**

- Message has `partial=true` flag set
- Will remain in dynamic section until partial flag is removed

#### 3. API Request Started Check

```
api_req_started completion check
{
  ts: 1234567890,
  hasStreamingFailed: true | false,
  hasCancelReason: true | false,
  hasCost: true | false,
  isComplete: true | false
}
```

**What it means:**

- Special handling for API request messages
- Complete when it has:
    - `streamingFailedMessage` (error occurred)
    - `cancelReason` (request was cancelled)
    - `cost` (request completed successfully)

#### 4. Ask Message Check

```
Ask message completion check
{
  ts: 1234567890,
  ask: "followup" | "tool" | "command" | etc.,
  isAnswered: true | false,
  isComplete: true | false
}
```

**What it means:**

- Most ask messages need to be answered to be complete
- `isAnswered: false` means waiting for user response
- Will move to static section once answered

**Special case - Non-rendering ask types:**

```
Ask message complete (non-rendering type)
{
  ts: 1234567890,
  ask: "completion_result" | "command_output"
}
```

- These ask types don't render (return null in router)
- They're immediately complete regardless of `isAnswered` status
- Examples: `completion_result`, `command_output`

#### 5. Extension Message Default

```
Extension message complete (default)
{
  ts: 1234567890,
  type: "say" | "ask",
  say: "text" | "completion_result" | etc.,
  partial: false | undefined
}
```

**What it means:**

- Message doesn't match special cases
- Complete by default if not partial

#### 6. Message Split Summary

```
Message split summary
{
  totalMessages: 10,
  staticCount: 7,
  dynamicCount: 3,
  lastCompleteIndex: 6,
  incompleteReasons: [
    {
      index: 7,
      reason: "Message not complete",
      message: { source: "extension", ts: 1234567890, ... }
    }
  ]
}
```

**What it means:**

- Shows the final split result
- `staticCount`: Messages that won't re-render
- `dynamicCount`: Messages that will continue updating
- `incompleteReasons`: Why messages aren't complete

## Common Issues

### Issue: Messages Not Completing

**Symptoms:**

- All messages stay in dynamic section
- Performance issues due to constant re-rendering

**Debug Steps:**

1. Check the "Message split summary" log
2. Look at `incompleteReasons` to see which message is blocking
3. Check that message's individual completion log

**Common Causes:**

- `api_req_started` message missing completion indicators (cost, error, or cancel)
- Ask message not marked as `isAnswered: true`
- Message has `partial: true` flag stuck

### Issue: Messages Completing Too Early

**Symptoms:**

- Messages appear in static section while still updating
- Content appears cut off or incomplete

**Debug Steps:**

1. Check individual message completion logs
2. Verify the message has correct `partial` flag
3. For `api_req_started`, verify completion indicators are set correctly

### Issue: Sequential Completion Gap

**Symptoms:**

- Later messages are complete but not moving to static
- `incompleteReasons` shows "Gap in completion"

**Debug Steps:**

1. Find the message at the gap index
2. Check why that specific message isn't completing
3. Fix the blocking message to allow later messages to become static

**Explanation:**
Messages must complete sequentially. If message #5 is incomplete, messages #6, #7, etc. cannot move to static even if they're complete. This prevents visual jumping and maintains message order.

## Example Debug Session

```
# Message 1 (CLI user message)
CLI message completion check { id: "1", type: "user", partial: false, isComplete: true }

# Message 2 (Extension API request)
api_req_started completion check { ts: 123, hasStreamingFailed: false, hasCancelReason: false, hasCost: false, isComplete: false }

# Message 3 (Extension text response)
Extension message incomplete: partial=true { ts: 124, type: "say", say: "text" }

# Split summary
Message split summary {
  totalMessages: 3,
  staticCount: 1,
  dynamicCount: 2,
  lastCompleteIndex: 0,
  incompleteReasons: [
    { index: 1, reason: "Message not complete", message: { source: "extension", ts: 123, ... } }
  ]
}
```

**Analysis:**

- Message 1 is complete and in static section
- Message 2 (API request) is blocking because it has no completion indicators
- Message 3 is also incomplete (partial=true)
- Only 1 message in static, 2 in dynamic

**Solution:**

- Wait for API request to complete (will get cost/error/cancel)
- Wait for text message to finish streaming (partial will become false)
