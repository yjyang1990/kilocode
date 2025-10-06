/**
 * Tests for StatusBar component
 */

import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "ink-testing-library"
import { StatusBar } from "../StatusBar.js"
import * as atoms from "../../../state/atoms/index.js"
import * as useGitInfoHook from "../../../state/hooks/useGitInfo.js"
import * as useContextUsageHook from "../../../state/hooks/useContextUsage.js"
import { useAtomValue } from "jotai"

// Mock the hooks and atoms
vi.mock("jotai")

vi.mock("../../../state/hooks/useGitInfo.js")
vi.mock("../../../state/hooks/useContextUsage.js")

describe("StatusBar", () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Setup default mock implementations
		vi.mocked(useAtomValue).mockImplementation((atom: any) => {
			if (atom === atoms.cwdAtom) return "/home/user/kilocode"
			if (atom === atoms.extensionModeAtom) return "code"
			if (atom === atoms.apiConfigurationAtom) return { apiModelId: "claude-sonnet-4" }
			if (atom === atoms.chatMessagesAtom) return []
			return null
		})

		vi.mocked(useGitInfoHook.useGitInfo).mockReturnValue({
			branch: "main",
			isClean: true,
			isRepo: true,
			loading: false,
		})

		vi.mocked(useContextUsageHook.useContextUsage).mockReturnValue({
			percentage: 45,
			tokensUsed: 90000,
			maxTokens: 200000,
			reservedForOutput: 8192,
			availableSize: 101808,
		})
	})

	it("should render project name", () => {
		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("kilocode")
	})

	it("should render git branch with clean status", () => {
		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("main")
		expect(lastFrame()).toContain("✓")
	})

	it("should render git branch with dirty status", () => {
		vi.mocked(useGitInfoHook.useGitInfo).mockReturnValue({
			branch: "feature",
			isClean: false,
			isRepo: true,
			loading: false,
		})

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("feature")
		expect(lastFrame()).toContain("⚠")
	})

	it("should not render git info for non-repo", () => {
		vi.mocked(useGitInfoHook.useGitInfo).mockReturnValue({
			branch: null,
			isClean: true,
			isRepo: false,
			loading: false,
		})

		const { lastFrame } = render(<StatusBar />)
		const frame = lastFrame()
		expect(frame).not.toContain("🌿")
	})

	it("should render current mode", () => {
		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("Code")
	})

	it("should render model name", () => {
		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("sonnet-4")
	})

	it("should render context usage percentage", () => {
		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("45%")
	})

	it("should handle missing cwd", () => {
		vi.mocked(useAtomValue).mockImplementation((atom: any) => {
			if (atom === atoms.cwdAtom) return null
			if (atom === atoms.extensionModeAtom) return "code"
			if (atom === atoms.apiConfigurationAtom) return null
			if (atom === atoms.chatMessagesAtom) return []
			return null
		})

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("N/A")
	})

	it("should handle missing api config", () => {
		vi.mocked(useAtomValue).mockImplementation((atom: any) => {
			if (atom === atoms.cwdAtom) return "/home/user/project"
			if (atom === atoms.extensionModeAtom) return "architect"
			if (atom === atoms.apiConfigurationAtom) return null
			if (atom === atoms.chatMessagesAtom) return []
			return null
		})

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("N/A")
	})

	it("should capitalize mode name", () => {
		vi.mocked(useAtomValue).mockImplementation((atom: any) => {
			if (atom === atoms.cwdAtom) return "/home/user/project"
			if (atom === atoms.extensionModeAtom) return "architect"
			if (atom === atoms.apiConfigurationAtom) return { apiModelId: "gpt-4" }
			if (atom === atoms.chatMessagesAtom) return []
			return null
		})

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("Architect")
	})

	it("should include all section separators", () => {
		const { lastFrame } = render(<StatusBar />)
		const frame = lastFrame()
		// Should have separators between sections
		expect(frame).toContain("│")
	})

	it("should include all emoji icons", () => {
		const { lastFrame } = render(<StatusBar />)
		const frame = lastFrame()
		expect(frame).toContain("📁") // Project
		expect(frame).toContain("🌿") // Git
		expect(frame).toContain("🎯") // Mode
		expect(frame).toContain("🤖") // Model
		expect(frame).toContain("📊") // Context
	})
})
