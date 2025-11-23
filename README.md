# @dexploarer/plugin-gateway

Unified AI gateway plugin for ElizaOS providing access to 200+ models across all major providers (OpenAI, Anthropic, Google, Meta, Mistral, xAI, etc.) via Vercel AI Gateway, OpenRouter, or direct Vercel AI SDK.

## Features

- **Single API Key**: Access 200+ models through Vercel AI Gateway or OpenRouter
- **Zero Markup**: Vercel AI Gateway passes through provider pricing with no additional cost
- **Automatic Fallback**: Cascading provider resolution based on available API keys
- **ElizaOS Native**: Registers handlers for all ElizaOS ModelTypes

## Installation

```bash
bun add @dexploarer/plugin-gateway
```

## Quick Start

```typescript
import { gatewayPlugin } from '@dexploarer/plugin-gateway';

const agent = {
  plugins: [gatewayPlugin],
  settings: {
    secrets: {
      // Option 1: Vercel AI Gateway (recommended - zero markup)
      AI_GATEWAY_API_KEY: "your-vercel-key",

      // Option 2: OpenRouter (single key for all providers)
      // OPENROUTER_API_KEY: "sk-or-...",

      // Option 3: Individual provider keys
      // OPENAI_API_KEY: "...",
      // ANTHROPIC_API_KEY: "...",
    },
  },
};
```

## Model Support

| ModelType | Default Model | Provider |
|-----------|---------------|----------|
| TEXT_LARGE | claude-sonnet-4 | Gateway/OpenRouter |
| TEXT_SMALL | gpt-4o-mini | Gateway/OpenRouter |
| TEXT_EMBEDDING | text-embedding-3-small | Gateway/OpenRouter |
| IMAGE | imagen-3 | Google via Gateway |

### Available Models

**Text Models:**
- Anthropic: claude-4-opus, claude-sonnet-4, claude-3.5-haiku
- OpenAI: gpt-4o, gpt-4o-mini, o1, o1-mini, o3-mini
- Google: gemini-2.0-flash, gemini-2.0-pro
- Meta: llama-3.3-70b, llama-3.1-405b
- DeepSeek: deepseek-v3, deepseek-r1
- xAI: grok-3

**Image Models:**
- Google: imagen-3, imagen-3-fast
- OpenAI: dall-e-3
- Flux: flux-pro

**Embeddings:**
- text-embedding-3-small, text-embedding-3-large

## Configuration

Override defaults via runtime settings:

```typescript
settings: {
  GATEWAY_CONFIG: {
    defaultTextProvider: "vercel-gateway",
    defaultImageProvider: "vercel-gateway",
    models: {
      textLarge: "claude-4-opus",
      textSmall: "claude-3.5-haiku",
      image: "imagen-3-fast",
    },
  },
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| AI_GATEWAY_API_KEY | Vercel AI Gateway (zero markup, recommended) |
| OPENROUTER_API_KEY | Single key for all providers via OpenRouter |
| OPENAI_API_KEY | Direct OpenAI access |
| ANTHROPIC_API_KEY | Direct Anthropic access |
| GOOGLE_GENERATIVE_AI_API_KEY | Direct Google access |
| GROQ_API_KEY | Direct Groq access |
| TOGETHER_API_KEY | Direct Together access |
| FIREWORKS_API_KEY | Direct Fireworks access |
| MISTRAL_API_KEY | Direct Mistral access |

## Development

```bash
bun install       # Install dependencies
bun run build     # Build (tsc)
bun run dev       # Watch mode
bun run clean     # Remove dist/
bun run lint      # ESLint
```

## License

MIT
