// kilocode_change - new file
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
			"GLM-4.5 is Zhipu's latest featured model. Its comprehensive capabilities in reasoning, coding, and agent reach the state-of-the-art (SOTA) level among open-source models, with a context length of up to 128k.",
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
			"GLM-4.5-Air is the lightweight version of GLM-4.5. It balances performance and cost-effectiveness, and can flexibly switch to hybrid thinking models.",
	},
} as const satisfies Record<string, ModelInfo>
