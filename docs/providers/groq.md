---
sidebar_label: Groq
---

# Using Groq With Kilo Code

Groq specializes in providing very high-speed inference for large language models, utilizing their custom-built Language Processing Units (LPUs). This can result in significantly faster response times for supported models.

**Website:** [https://groq.com/](https://groq.com/)

## Getting an API Key

To use Groq with Kilo Code, you'll need an API key from the [GroqCloud Console](https://console.groq.com/). After signing up or logging in, navigate to the API Keys section of your dashboard to create and copy your key.

## Supported Models

Kilo Code will attempt to fetch the list of available models from the Groq API. Common models available via Groq include:

*   `llama3-8b-8192`
*   `llama3-70b-8192`
*   `mixtral-8x7b-32768`
*   `gemma-7b-it`
*   `moonshotai/kimi-k2-instruct` (Kimi K2 model)

**Note:** Model availability and specifications may change. Refer to the [Groq Documentation](https://console.groq.com/docs/models) for the most up-to-date list of supported models and their capabilities.

## Configuration in Kilo Code

1.  **Open Kilo Code Settings:** Click the gear icon (<Codicon name="gear" />) in the Kilo Code panel.
2.  **Select Provider:** Choose "Groq" from the "API Provider" dropdown.
3.  **Enter API Key:** Paste your Groq API key into the "Groq API Key" field.
4.  **Select Model:** Choose your desired model from the "Model" dropdown.

## Tips and Notes

*   **High-Speed Inference:** Groq's LPUs provide exceptionally fast response times, making it ideal for interactive development workflows.
*   **Token Limits:** Some models have specific `max_tokens` limits that are automatically handled by Kilo Code (e.g., the `moonshotai/kimi-k2-instruct` model).
*   **Cost Efficiency:** Groq often provides competitive pricing for high-speed inference compared to other providers.
*   **Model Selection:** Choose models based on your specific needs - larger models like `llama3-70b-8192` for complex reasoning tasks, or smaller models like `llama3-8b-8192` for faster, simpler operations.