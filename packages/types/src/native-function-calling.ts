// kilocode_change - file added

import { z } from "zod"

export const toolUseStyles = ["xml", "json"] as const

export const toolUseStylesSchema = z.enum(toolUseStyles)

export type ToolUseStyle = z.infer<typeof toolUseStylesSchema>

// a list of all provider slugs that have been tested to support native function calling
export const nativeFunctionCallingProviders = ["openrouter", "kilocode"]
