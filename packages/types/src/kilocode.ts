import { z } from "zod"

export const ghostServiceSettingsSchema = z
	.object({
		enableAutoTrigger: z.boolean().optional(),
		autoTriggerDelay: z.number().min(1).max(5000).default(3000).optional(),
		enableQuickInlineTaskKeybinding: z.boolean().optional(),
		enableSmartInlineTaskKeybinding: z.boolean().optional(),
		showGutterAnimation: z.boolean().optional(),
	})
	.optional()

export type GhostServiceSettings = z.infer<typeof ghostServiceSettingsSchema>

export function normalizeAutoTriggerDelay(value: number | undefined): number {
	if (value === undefined) return 3000
	if (value < 50) {
		// it used to be seconds, not milliseconds, so anything below 50 (current min)
		// is seconds, so we convert it to milliseconds
		return Math.min(value, 5) * 1000
	}
	return value
}

export const commitRangeSchema = z.object({
	from: z.string(),
	fromTimeStamp: z.number().optional(),
	to: z.string(),
})

export type CommitRange = z.infer<typeof commitRangeSchema>

export const kiloCodeMetaDataSchema = z.object({
	commitRange: commitRangeSchema.optional(),
})

export type KiloCodeMetaData = z.infer<typeof kiloCodeMetaDataSchema>

export const fastApplyModelSchema = z.enum([
	"auto",
	"morph/morph-v3-fast",
	"morph/morph-v3-large",
	"relace/relace-apply-3",
])

export type FastApplyModel = z.infer<typeof fastApplyModelSchema>
