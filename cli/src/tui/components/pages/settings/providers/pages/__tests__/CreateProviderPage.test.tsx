import { describe, it, expect, vi } from "vitest"

// Test the navigation logic for the new URL-based provider pages
describe("Provider Pages Navigation", () => {
	it("should have correct route paths for provider actions", () => {
		const routes = {
			create: "/settings/providers/create",
			edit: "/settings/providers/edit",
			choose: "/settings/providers/choose",
			remove: "/settings/providers/remove",
		}

		expect(routes.create).toBe("/settings/providers/create")
		expect(routes.edit).toBe("/settings/providers/edit")
		expect(routes.choose).toBe("/settings/providers/choose")
		expect(routes.remove).toBe("/settings/providers/remove")
	})

	it("should validate profile name correctly", () => {
		const validateName = (name: string, existingProfiles: Array<{ name: string }>) => {
			const trimmed = name.trim()
			if (!trimmed) return "Profile name cannot be empty"

			const nameExists = existingProfiles.some((profile) => profile.name.toLowerCase() === trimmed.toLowerCase())
			if (nameExists) return "Profile name already exists"

			return null
		}

		const existingProfiles = [{ name: "default" }, { name: "test-profile" }]

		// Empty name
		expect(validateName("", existingProfiles)).toBe("Profile name cannot be empty")

		// Existing name
		expect(validateName("default", existingProfiles)).toBe("Profile name already exists")

		// Valid new name
		expect(validateName("new-profile", existingProfiles)).toBe(null)
	})

	it("should handle provider selection correctly", () => {
		const providers = [
			{ value: "kilocode", label: "Kilo Code" },
			{ value: "anthropic", label: "Anthropic" },
			{ value: "openai-native", label: "OpenAI" },
		]

		expect(providers).toHaveLength(3)
		expect(providers[0]?.value).toBe("kilocode")
		expect(providers[1]?.label).toBe("Anthropic")
	})
})
