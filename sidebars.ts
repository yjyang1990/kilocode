import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installing',
        {
          type: 'doc',
          id: 'getting-started/free-tokens',
          label: 'Setup',
        },
        'getting-started/your-first-task',
      ],
    },
    {
      type: 'category',
      label: 'Using Kilo Code',
      items: [
        'basic-usage/the-chat-interface',
        'basic-usage/typing-your-requests',
        'basic-usage/using-modes',
        'basic-usage/how-tools-work',
        'basic-usage/context-mentions',
        'features/enhance-prompt',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'features/auto-approving-actions',
        'features/suggested-responses',
        'features/code-actions',
        'features/checkpoints',
        'features/tools/tool-use-overview',
        'tips-and-tricks',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Usage',
      items: [
        'advanced-usage/prompt-engineering',
        'advanced-usage/large-projects',
        'features/boomerang-tasks',
        'features/fast-edits',
        'features/model-temperature',
        'advanced-usage/rate-limits-costs',
        'features/footgun-prompting',
      ],
    },
    {
      type: 'category',
      label: 'Customization',
      items: [
        'features/settings-management',
        'features/custom-modes',
        'getting-started/connecting-api-provider',
        'features/api-configuration-profiles',
      ],
    },
    {
      type: 'category',
      label: 'Extending Kilo Code',
      items: [
        {
          type: 'category',
          label: 'Model Providers',
          items: [
            'providers/kilocode',
            'providers/anthropic',
            'providers/bedrock',
            'providers/deepseek',
            'providers/vertex',
            'providers/gemini',
            'providers/glama',
            'providers/human-relay',
            'providers/lmstudio',
            'providers/mistral',
            'providers/ollama',
            'providers/openai',
            'providers/openai-compatible',
            'providers/openrouter',
            'providers/requesty',
            'providers/unbound',
            'providers/vscode-lm',
          ]
        },
        'advanced-usage/local-models',
        {
          type: 'doc',
          id: 'features/mcp/overview',
          label: 'MCP',
        },
        'troubleshooting/shell-integration',
      ],
    },
    {
      type: 'category',
      label: 'Tools Reference',
      items: [
        'features/tools/access-mcp-resource',
        'features/tools/apply-diff',
        'features/tools/ask-followup-question',
        'features/tools/attempt-completion',
        'features/tools/browser-action',
        'features/tools/execute-command',
        'features/tools/list-code-definition-names',
        'features/tools/list-files',
        'features/tools/new-task',
        'features/tools/read-file',
        'features/tools/search-files',
        'features/tools/switch-mode',
        'features/tools/use-mcp-tool',
        'features/tools/write-to-file',
      ],
    },
  ],
};

export default sidebars;
