---
"kilo-code": minor
---

Include changes from Roo Code v3.23.19

- Fix configurable delay for diagnostics to prevent premature error reporting
- Add command timeout allowlist
- Add description and whenToUse fields to custom modes in .roomodes (thanks @RandalSchwartz!)
- Fix Claude model detection by name for API protocol selection (thanks @daniel-lxs!)
- Optional setting to prevent completion with open todos
- Add global rate limiting for OpenAI-compatible embeddings (thanks @daniel-lxs!)
- Add batch limiting to code indexer (thanks @daniel-lxs!)
- Add: Moonshot provider (thanks @CellenLee!)
- Add: Qwen/Qwen3-235B-A22B-Instruct-2507 model to Chutes AI provider
- Fix: move context condensing prompt to Prompts section (thanks @SannidhyaSah!)
- Add: jump icon for newly created files
- Fix: add character limit to prevent terminal output context explosion
- Fix: resolve global mode export not including rules files
- Add: auto-omit MCP content when no servers are configured
- Fix: sort symlinked rules files by symlink names, not target names
- Docs: clarify when to use update_todo_list tool
- Add: Mistral embedding provider (thanks @SannidhyaSah!)
- Fix: add run parameter to vitest command in rules (thanks @KJ7LNW!)
- Update: the max_tokens fallback logic in the sliding window
- Fix: Bedrock and Vertext token counting improvements (thanks @daniel-lxs!)
- Add: llama-4-maverick model to Vertex AI provider (thanks @MuriloFP!)
- Fix: properly distinguish between user cancellations and API failures
- Fix: add case sensitivity mention to suggested fixes in apply_diff error message
- Fix: Resolve 'Bad substitution' error in command parsing (#5978 by @KJ7LNW, PR by @daniel-lxs)
- Fix: Add ErrorBoundary component for better error handling (#5731 by @elianiva, PR by @KJ7LNW)
- Improve: Use SIGKILL for command execution timeouts in the "execa" variant (thanks @cte!)
- Split commands on newlines when evaluating auto-approve
- Smarter auto-deny of commands
