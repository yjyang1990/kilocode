# ExtensionService

A stateless service layer for managing the ExtensionHost and MessageBridge in the Kilo Code CLI.

## Overview

The `ExtensionService` is a refactored version of `KiloCodeCLI` that separates concerns by:

- Removing all UI rendering logic
- Providing an event-driven interface
- Being completely stateless
- Focusing solely on extension lifecycle and message bridging

## Architecture

```
┌─────────────────────┐
│  ExtensionService   │
│   (Event Emitter)   │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
    ┌──────▼──────┐   ┌─────▼──────┐
    │ ExtensionHost│   │MessageBridge│
    └──────┬──────┘   └─────┬──────┘
           │                 │
    ┌──────▼──────┐   ┌─────▼──────┐
    │  VSCode API │   │ IPC Channels│
    │    Mock     │   │             │
    └─────────────┘   └─────────────┘
```

## Key Features

### 1. Stateless Design

- No UI state management
- No rendering concerns
- Pure service layer

### 2. Event-Driven Interface

Emits events that can be consumed by Jotai atoms or other state management:

```typescript
service.on("ready", (api) => {
	// Extension is ready
})

service.on("stateChange", (state) => {
	// Update UI state atoms
})

service.on("message", (message) => {
	// Handle extension messages
})

service.on("error", (error) => {
	// Handle errors
})
```

### 3. Lifecycle Management

```typescript
// Initialize
await service.initialize()

// Check readiness
if (service.isReady()) {
	// Service is ready
}

// Send messages
await service.sendWebviewMessage({ type: "askResponse", text: "Hello" })

// Dispose
await service.dispose()
```

### 4. Type-Safe API

- Full TypeScript support
- Typed event emitters
- Comprehensive interfaces

## Usage Example

```typescript
import { createExtensionService } from "./services/ExtensionService"

// Create service
const service = createExtensionService({
	workspace: "/path/to/workspace",
	mode: "code",
	autoApprove: false,
})

// Listen for events
service.on("ready", (api) => {
	console.log("Extension ready")
})

service.on("stateChange", (state) => {
	// Update Jotai atoms
	updateStateAtom(state)
})

service.on("message", (message) => {
	// Handle messages
	handleExtensionMessage(message)
})

// Initialize
await service.initialize()

// Send messages
await service.sendWebviewMessage({
	type: "askResponse",
	text: "User response",
})

// Clean up
await service.dispose()
```

## Integration with Jotai

The service is designed to work seamlessly with Jotai atoms:

```typescript
import { atom } from "jotai"
import { createExtensionService } from "./services/ExtensionService"

// Create atoms
const extensionStateAtom = atom<ExtensionState | null>(null)
const isReadyAtom = atom(false)

// Create service
const service = createExtensionService()

// Connect events to atoms
service.on("stateChange", (state) => {
	// Update atom (in actual implementation, use proper Jotai setters)
	extensionStateAtom.init = state
})

service.on("ready", () => {
	isReadyAtom.init = true
})
```

## API Reference

### Constructor Options

```typescript
interface ExtensionServiceOptions {
	workspace?: string // Workspace directory path
	mode?: string // Initial mode (default: 'code')
	autoApprove?: boolean // Enable auto-approve (default: false)
	extensionBundlePath?: string // Custom extension bundle path
	extensionRootPath?: string // Custom extension root path
}
```

### Events

```typescript
interface ExtensionServiceEvents {
	ready: (api: ExtensionAPI) => void
	stateChange: (state: ExtensionState) => void
	message: (message: ExtensionMessage) => void
	error: (error: Error) => void
	disposed: () => void
}
```

### Methods

- `initialize(): Promise<void>` - Initialize the service
- `sendWebviewMessage(message: WebviewMessage): Promise<void>` - Send message to extension
- `getState(): ExtensionState | null` - Get current extension state
- `getMessageBridge(): MessageBridge` - Get message bridge instance
- `getExtensionHost(): ExtensionHost` - Get extension host instance
- `getExtensionAPI(): ExtensionAPI | null` - Get extension API
- `isReady(): boolean` - Check if service is ready
- `dispose(): Promise<void>` - Dispose the service

## Differences from KiloCodeCLI

| Feature           | KiloCodeCLI               | ExtensionService      |
| ----------------- | ------------------------- | --------------------- |
| UI Rendering      | ✅ Includes Ink rendering | ❌ No UI concerns     |
| State Management  | ✅ Manages UI state       | ❌ Stateless          |
| Event Interface   | ❌ Limited                | ✅ Comprehensive      |
| Splash Screen     | ✅ Shows splash           | ❌ No UI              |
| Direct Usage      | ✅ CLI entry point        | ❌ Service layer only |
| Jotai Integration | ❌ Not designed for it    | ✅ Perfect fit        |

## Testing

The service includes comprehensive tests covering:

- Constructor and initialization
- Event handling
- Message sending
- State management
- API access
- Disposal and cleanup

Note: Tests require the extension bundle to be built for full integration testing.

## Migration Path

To migrate from `KiloCodeCLI` to `ExtensionService`:

1. Replace `KiloCodeCLI` instantiation with `ExtensionService`
2. Move UI rendering to separate components
3. Connect service events to Jotai atoms
4. Use atoms for state management in UI components

## Future Enhancements

- [ ] Add retry logic for initialization failures
- [ ] Implement connection health monitoring
- [ ] Add metrics and telemetry hooks
- [ ] Support for multiple concurrent services
- [ ] Enhanced error recovery mechanisms
