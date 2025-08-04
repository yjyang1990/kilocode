import type { ModelInfo } from "../model.js"

// https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E5%AF%B9%E8%AF%9D%E8%A1%A5%E5%85%A8
export type BigModelModelId = keyof typeof bigModelModels

export const bigModelDefaultModelId: BigModelModelId = "glm-4.5"

export const bigModelModels = {
	"glm-4.5": {
		maxTokens: 98304,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.6,
		outputPrice: 2.2,
		cacheWritesPrice: 0.11,
		cacheReadsPrice: 0,
		description:
			"Z.ai‘s latest flagship model reaches SOTA among global open-source models in overall capabilities, and for the first time natively integrates reasoning, coding, and agent functionalities within a single model!",
	},
	"glm-4.5-air": {
		maxTokens: 98304,
		contextWindow: 131072,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.2,
		outputPrice: 1.1,
		cacheWritesPrice: 0.03,
		cacheReadsPrice: 0,
		description:
			"Z.ai's new lightweight flagship model delivers SOTA performance with exceptional cost-effectiveness!",
	},
} as const satisfies Record<string, ModelInfo>
