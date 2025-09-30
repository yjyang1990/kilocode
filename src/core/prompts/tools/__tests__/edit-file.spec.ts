import { describe, it, expect, vi } from "vitest"
import { getFastApplyEditingInstructions, getModelType } from "../edit-file"

describe("getFastApplyEditingInstructions", () => {
	it("should return instructions", () => {
		const instructions = getFastApplyEditingInstructions()
		expect(instructions).toContain("FastApply is enabled")
		expect(instructions).toContain("edit_file")
		expect(instructions).toContain("target_file")
	})
})

describe("getModelType", () => {
	it("should return relace for relace models", () => {
		expect(getModelType("relace/relace-apply-3")).toBe("relace")
		expect(getModelType("relace-v2")).toBe("relace")
	})

	it("should return morph for morph models", () => {
		expect(getModelType("morph-v3-fast")).toBe("morph")
		expect(getModelType("morph-v3-large")).toBe("morph")
		expect(getModelType("morph/morph-v3-large")).toBe("morph")
	})

	it("should return morph for auto", () => {
		expect(getModelType("auto")).toBe("morph")
	})

	it("should return morph for unknown models", () => {
		expect(getModelType("unknown-model")).toBe("morph")
	})
})
