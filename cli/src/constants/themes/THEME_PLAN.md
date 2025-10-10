# CLI Theme System Design

## Overview

A unified theme system for the Kilo Code CLI that consolidates color usage across all UI components into semantic categories.

## File Structure

```
cli/src/
├── types/
│   └── theme.ts              # Theme type definitions
├── constants/themes/
│   ├── index.ts              # Theme registry and helper functions
│   ├── dark.ts               # Dark theme implementation
│   └── THEME_PLAN.md         # This documentation
├── config/
│   ├── types.ts              # Config types (includes theme field)
│   └── defaults.ts           # Default config (includes default theme)
└── state/
    ├── atoms/
    │   └── config.ts         # Config atoms (includes themeAtom)
    └── hooks/
        └── useTheme.ts       # Hook to access current theme
```

## Theme Structure

### Core Theme Interface

```typescript
interface Theme {
	// Brand Identity
	brand: {
		primary: string // Yellow - #F7F864 (logo, brand elements)
		secondary: string // Cyan (secondary brand accent)
	}

	// Semantic Colors
	semantic: {
		success: string // Green (successful operations, completions)
		error: string // Red (errors, failures)
		warning: string // Yellow (warnings, attention needed)
		info: string // Cyan (informational messages)
		neutral: string // Gray (neutral/secondary information)
	}

	// Interactive Elements
	interactive: {
		prompt: string // Cyan (input prompts)
		selection: string // Green (selected items in menus)
		hover: string // White (hover states)
		disabled: string // Gray (disabled elements)
		focus: string // Yellow (focused elements)
	}

	// Message Types
	messages: {
		user: string // Blue (user messages)
		assistant: string // Green (AI assistant messages)
		system: string // Gray (system messages)
		error: string // Red (error messages)
	}

	// Actions (unified for approve/reject patterns)
	actions: {
		approve: string // Green (positive actions)
		reject: string // Red (negative actions)
		cancel: string // Gray (cancel/neutral actions)
		pending: string // Yellow (pending actions)
	}

	// Code/Diff Display
	code: {
		addition: string // Green (added lines)
		deletion: string // Red (removed lines)
		modification: string // Yellow (modified lines)
		context: string // Gray (context lines)
		lineNumber: string // Cyan (line numbers)
	}

	// UI Structure
	ui: {
		border: {
			default: string // Gray (default borders)
			active: string // Cyan (active element borders)
			warning: string // Yellow (warning borders)
			error: string // Red (error borders)
		}
		text: {
			primary: string // White (primary text)
			secondary: string // Gray (secondary text)
			dimmed: string // Gray with dim flag (less important text)
			highlight: string // Yellow (highlighted text)
		}
		background: {
			default: string // Terminal default
			elevated: string // Slightly different for cards/boxes
		}
	}

	// Status Indicators
	status: {
		online: string // Green
		offline: string // Red
		busy: string // Yellow
		idle: string // Gray
	}
}
```

## Default Theme Implementation

```typescript
export const defaultTheme: Theme = {
	brand: {
		primary: "#F7F864", // Kilo Code yellow
		secondary: "cyan",
	},

	semantic: {
		success: "green",
		error: "red",
		warning: "yellow",
		info: "cyan",
		neutral: "gray",
	},

	interactive: {
		prompt: "cyan",
		selection: "green",
		hover: "white",
		disabled: "gray",
		focus: "yellow",
	},

	messages: {
		user: "blue",
		assistant: "green",
		system: "gray",
		error: "red",
	},

	actions: {
		approve: "green",
		reject: "red",
		cancel: "gray",
		pending: "yellow",
	},

	code: {
		addition: "green",
		deletion: "red",
		modification: "yellow",
		context: "gray",
		lineNumber: "cyan",
	},

	ui: {
		border: {
			default: "gray",
			active: "cyan",
			warning: "yellow",
			error: "red",
		},
		text: {
			primary: "white",
			secondary: "gray",
			dimmed: "gray", // Will use with dimColor prop
			highlight: "yellow",
		},
		background: {
			default: "default",
			elevated: "default",
		},
	},

	status: {
		online: "green",
		offline: "red",
		busy: "yellow",
		idle: "gray",
	},
}
```

## Usage Examples

### Component Color Mapping

#### ApprovalMenu.tsx

- Border: `theme.ui.border.warning` (yellow)
- Title: `theme.semantic.warning` (yellow)
- Approve option: `theme.actions.approve` (green)
- Reject option: `theme.actions.reject` (red)
- Selected indicator: Dynamic based on option color
- Help text: `theme.ui.text.secondary` (gray)

#### CommandInput.tsx

- Normal border: `theme.ui.border.active` (cyan)
- Approval border: `theme.ui.border.warning` (yellow)
- Prompt symbol: `theme.interactive.prompt` (cyan)
- Approval prompt: `theme.semantic.warning` (yellow)

#### StatusBar.tsx

- Project name: `theme.interactive.prompt` (cyan)
- Git clean: `theme.semantic.success` (green)
- Git dirty: `theme.semantic.warning` (yellow)
- Mode: `'magenta'` (keep as is for distinction)
- Model: `theme.messages.user` (blue)
- Context usage: Dynamic based on percentage

#### AutocompleteMenu.tsx

- Border: `theme.ui.border.default` or `theme.ui.border.active`
- Title: `theme.interactive.prompt` (cyan)
- Selected item: `theme.interactive.selection` (green)
- Unselected item: `theme.ui.text.primary` (white)
- Help text: `theme.ui.text.secondary` (gray)

#### FollowupSuggestionsMenu.tsx

- Border: `theme.ui.border.warning` (yellow)
- Title: `theme.semantic.warning` (yellow)
- Selected item: `theme.semantic.warning` (yellow)
- Unselected item: `theme.ui.text.primary` (white)

#### Message Components

- User messages: `theme.messages.user` (blue)
- Assistant messages: `theme.messages.assistant` (green)
- System messages: `theme.messages.system` (gray)
- Error messages: `theme.messages.error` (red)

#### Tool Messages

- Tool operations: `theme.interactive.prompt` (cyan)
- Success indicators: `theme.semantic.success` (green)
- Error indicators: `theme.semantic.error` (red)
- Warning indicators: `theme.semantic.warning` (yellow)

## Theme Provider Implementation

```typescript
// Theme context for runtime theme switching
import { createContext, useContext } from 'react';

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

export const ThemeProvider: React.FC<{ theme?: Theme; children: React.ReactNode }> = ({
  theme = defaultTheme,
  children
}) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Migration Strategy

1. **Phase 1**: Create theme structure and default theme
2. **Phase 2**: Add theme provider to App.tsx
3. **Phase 3**: Update components to use theme colors
4. **Phase 4**: Add theme customization support

## Benefits

1. **Consistency**: All similar actions use the same colors
2. **Maintainability**: Single source of truth for colors
3. **Extensibility**: Easy to add new themes or color schemes
4. **Semantic**: Colors have meaning, not just arbitrary assignments
5. **Accessibility**: Can easily create high-contrast themes

## Future Enhancements

1. **Multiple Themes**: Dark, light, high-contrast themes
2. **User Customization**: Allow users to customize theme via config
3. **Color Blindness Support**: Alternative themes for accessibility
4. **Dynamic Theming**: Change theme based on time of day or user preference
