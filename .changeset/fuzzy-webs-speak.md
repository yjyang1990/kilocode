---
"kilo-code": minor
---

(also thanks to @NaccOll for paving the way) - Preliminary support for native tool calling (a.k.a native function calling) was added.

This feature is currently experimental and mostly intended for users interested in contributing to its development.
It is so far only supported when using OpenRouter or Kilo Code providers. There are possible issues including, but not limited to:

- Missing tools
- Tools calls not updating the UI until they are complete
- Tools being available in modes where they should not be
- MCP servers not working
- Errors specific to certain inference providers

Native tool calling can be enabled in Providers Settings > Advanced Settings > Tool Call Style > JSON.
It is enabled by default for Claude Haiku 4.5, because that model does not work at all otherwise.
