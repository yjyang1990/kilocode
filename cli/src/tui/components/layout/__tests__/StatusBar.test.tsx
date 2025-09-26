import React from "react"
import { render } from "ink-testing-library"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { StatusBar } from "../StatusBar.js"

// Mock the context hooks
vi.mock("../../../context/index.js", () => ({
	useExtensionState: vi.fn(),
	useCliState: vi.fn(),
}))

import { useExtensionState, useCliState } from "../../../context/index.js"

describe("StatusBar", () => {
	const mockCliState = {
		workspace: "/home/user/projects/my-project",
	}

	beforeEach(() => {
		vi.clearAllMocks()
		;(useCliState as any).mockReturnValue(mockCliState)
	})

	it("should display correct model for kilocode provider", () => {
		const mockExtensionState = {
			mode: "code",
			apiConfiguration: {
				apiProvider: "kilocode",
				kilocodeModel: "anthropic/claude-sonnet-4",
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("kilocode")
		expect(lastFrame()).toContain("claude-sonnet-4") // Display name removes provider prefix
	})

	it("should display correct model for openrouter provider", () => {
		const mockExtensionState = {
			mode: "architect",
			apiConfiguration: {
				apiProvider: "openrouter",
				openRouterModelId: "openai/gpt-4",
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("openrouter")
		expect(lastFrame()).toContain("gpt-4") // Display name removes provider prefix
	})

	it("should display correct model for ollama provider", () => {
		const mockExtensionState = {
			mode: "debug",
			apiConfiguration: {
				apiProvider: "ollama",
				ollamaModelId: "llama2:7b",
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("ollama")
		expect(lastFrame()).toContain("llama2:7b")
	})

	it("should display correct model for lmstudio provider", () => {
		const mockExtensionState = {
			mode: "test",
			apiConfiguration: {
				apiProvider: "lmstudio",
				lmStudioModelId: "local-model",
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("lmstudio")
		expect(lastFrame()).toContain("local-model")
	})

	it("should display 'unknown' when model is not set", () => {
		const mockExtensionState = {
			mode: "code",
			apiConfiguration: {
				apiProvider: "kilocode",
				// No kilocodeModel field
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("unknown")
	})

	it("should display 'default' for providers without model selection", () => {
		const mockExtensionState = {
			mode: "code",
			apiConfiguration: {
				apiProvider: "anthropic",
				apiKey: "some-key",
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("anthropic")
		expect(lastFrame()).toContain("default")
	})

	it("should handle vscode-lm provider correctly", () => {
		const mockExtensionState = {
			mode: "code",
			apiConfiguration: {
				apiProvider: "vscode-lm",
				vsCodeLmModelSelector: {
					vendor: "microsoft",
					family: "copilot",
				},
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("vscode-lm")
		expect(lastFrame()).toContain("copilot") // Display name removes vendor prefix
	})

	it("should handle missing extension state", () => {
		;(useExtensionState as any).mockReturnValue(undefined)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("unknown") // mode
		expect(lastFrame()).toContain("unknown") // provider
		expect(lastFrame()).toContain("unknown") // model
	})

	it("should display project name correctly", () => {
		const mockExtensionState = {
			mode: "code",
			apiConfiguration: {
				apiProvider: "kilocode",
				kilocodeModel: "test-model",
			},
		}
		;(useExtensionState as any).mockReturnValue(mockExtensionState)

		const { lastFrame } = render(<StatusBar />)
		expect(lastFrame()).toContain("my-project")
	})
})
