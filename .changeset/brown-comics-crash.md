---
"kilo-code": minor
---

Include changes from Roo Code v3.28.8-v3.28.13

- Fix: Remove topP parameter from Bedrock inference config (#8377 by @ronyblum, PR by @daniel-lxs)
- Fix: Correct Vertex AI Sonnet 4.5 model configuration (#8387 by @nickcatal, PR by @mrubens!)
- Fix: Correct Anthropic Sonnet 4.5 model ID and add Bedrock 1M context checkbox (thanks @daniel-lxs!)
- Fix: Correct AWS Bedrock Claude Sonnet 4.5 model identifier (#8371 by @sunhyung, PR by @app/roomote)
- Fix: Correct Claude Sonnet 4.5 model ID format (thanks @daniel-lxs!)
- Fix: Make chat icons properly sized with shrink-0 class (thanks @mrubens!)
- The free Supernova model now has a 1M token context window (thanks @mrubens!)
- Fix: Remove <thinking> tags from prompts for cleaner output and fewer tokens (#8318 by @hannesrudolph, PR by @app/roomote)
- Correct tool use suggestion to improve model adherence to suggestion (thanks @hannesrudolph!)
- Removing user hint when refreshing models (thanks @requesty-JohnCosta27!)
- Fix: Resolve frequent "No tool used" errors by clarifying tool-use rules (thanks @hannesrudolph!)
- Fix: Include initial ask in condense summarization (thanks @hannesrudolph!)
