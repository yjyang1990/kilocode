---
"kilo-code": minor
---

Include changes from Roo Code v3.28.0-v3.28.2:

- Improve auto-approve UI with smaller and more subtle design (thanks @brunobergher!)
- Fix: Message queue re-queue loop in Task.ask() causing performance issues (#7861 by @hannesrudolph, PR by @daniel-lxs)
- Fix: Restrict @-mention parsing to line-start or whitespace boundaries to prevent false triggers (#7875 by @hannesrudolph, PR by @app/roomote)
- Fix: Make nested git repository warning persistent with path info for better visibility (#7884 by @hannesrudolph, PR by @app/roomote)
- Fix: Include API key in Ollama /api/tags requests for authenticated instances (#7902 by @ItsOnlyBinary, PR by @app/roomote)
- Fix: Preserve original first message context during conversation condensing (thanks @daniel-lxs!)
- Make Posthog telemetry the default (thanks @mrubens!)
- Bust cache in generated image preview (thanks @mrubens!)
- Fix: Center active mode in selector dropdown on open (#7882 by @hannesrudolph, PR by @app/roomote)
- Fix: Preserve first message during conversation condensing (thanks @daniel-lxs!)
- feat: Add click-to-edit, ESC-to-cancel, and fix padding consistency for chat messages (#7788 by @hannesrudolph, PR by @app/roomote)
- feat: Make reasoning more visible (thanks @app/roomote!)
- fix: Fix Groq context window display (thanks @mrubens!)
- fix: Add GIT_EDITOR env var to merge-resolver mode for non-interactive rebase (thanks @daniel-lxs!)
- fix: Resolve chat message edit/delete duplication issues (thanks @daniel-lxs!)
- fix: Reduce CodeBlock button z-index to prevent overlap with popovers (#7703 by @A0nameless0man, PR by @daniel-lxs)
- fix: Revert PR #7188 - Restore temperature parameter to fix TabbyApi/ExLlamaV2 crashes (#7581 by @drknyt, PR by @daniel-lxs)
- fix: Make ollama models info transport work like lmstudio (#7674 by @ItsOnlyBinary, PR by @ItsOnlyBinary)
- fix: Update DeepSeek pricing to new unified rates effective Sept 5, 2025 (#7685 by @NaccOll, PR by @app/roomote)
- feat: Update Vertex AI models and regions (#7725 by @ssweens, PR by @ssweens)
