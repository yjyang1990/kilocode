---
"kilo-code": minor
---

Include changes from Roo Code v3.25.20

- Fix: respect enableReasoningEffort setting when determining reasoning usage (#7048 by @ikbencasdoei, PR by @app/roomote)
- Fix: prevent duplicate LM Studio models with case-insensitive deduplication (#6954 by @fbuechler, PR by @daniel-lxs)
- Feat: simplify ask_followup_question prompt documentation (thanks @daniel-lxs!)
- Feat: simple read_file tool for single-file-only models (thanks @daniel-lxs!)
- Fix: Add missing zaiApiKey and doubaoApiKey to SECRET_STATE_KEYS (#7082 by @app/roomote)
- Feat: Add new models and update configurations for vscode-lm (thanks @NaccOll!)
- Fix: Resolve terminal reuse logic issues
- Add support for OpenAI gpt-5-chat-latest model (#7057 by @PeterDaveHello, PR by @app/roomote)
- Fix: Use native Ollama API instead of OpenAI compatibility layer (#7070 by @LivioGama, PR by @daniel-lxs)
- Fix: Prevent XML entity decoding in diff tools (#7107 by @indiesewell, PR by @app/roomote)
- Fix: Add type check before calling .match() on diffItem.content (#6905 by @pwilkin, PR by @app/roomote)
- Refactor task execution system: improve call stack management (thanks @catrielmuller!)
- Fix: Enable save button for provider dropdown and checkbox changes (thanks @daniel-lxs!)
- Add an API for resuming tasks by ID (thanks @mrubens!)
- Emit event when a task ask requires interaction (thanks @cte!)
- Make enhance with task history default to true (thanks @liwilliam2021!)
- Fix: Use cline.cwd as primary source for workspace path in codebaseSearchTool (thanks @NaccOll!)
- Hotfix multiple folder workspace checkpoint (thanks @NaccOll!)
- Fix: Remove 500-message limit to prevent scrollbar jumping in long conversations (#7052, #7063 by @daniel-lxs, PR by @app/roomote)
- Fix: Reset condensing state when switching tasks (#6919 by @f14XuanLv, PR by @f14XuanLv)
- Fix: Implement sitemap generation in TypeScript and remove XML file (#5231 by @abumalick, PR by @abumalick)
- Fix: allowedMaxRequests and allowedMaxCost values not showing in the settings UI (thanks @chrarnoldus!)
