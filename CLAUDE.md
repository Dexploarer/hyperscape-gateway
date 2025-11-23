# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@dexploarer/plugin-gateway** is an ElizaOS plugin providing unified AI model access through Vercel AI Gateway, OpenRouter, and direct Vercel AI SDK integration. It supports 200+ models across all major providers (OpenAI, Anthropic, Google, Meta, Mistral, xAI, etc.) via a single API key.

## Commands

```bash
bun install       # Install dependencies
bun run build     # Build (tsc)
bun run dev       # Watch mode
bun run clean     # Remove dist/
bun run lint      # ESLint
```

## Usage

```typescript
import { gatewayPlugin } from '@dexploarer/plugin-gateway';

const agent = {
  plugins: [gatewayPlugin],
  settings: {
    secrets: {
      // Vercel AI Gateway - zero markup (recommended)
      AI_GATEWAY_API_KEY: "your-vercel-key",
      // Or OpenRouter - single key for all providers:
      // OPENROUTER_API_KEY: "sk-or-...",
      // Or individual provider keys:
      // OPENAI_API_KEY: "...",
      // ANTHROPIC_API_KEY: "...",
    },
  },
};
```

## Architecture

### Model Handlers

The plugin registers handlers for ElizaOS ModelType:

| ModelType | Default Model | Via |
|-----------|---------------|-----|
| TEXT_LARGE | claude-sonnet-4 | Gateway/OpenRouter |
| TEXT_SMALL | gpt-4o-mini | Gateway/OpenRouter |
| TEXT_EMBEDDING | text-embedding-3-small | Gateway/OpenRouter |
| IMAGE | imagen-3 (Google) | Gateway/OpenRouter |

### Key Files

- `src/index.ts` - Plugin entry, model handler registration
- `src/providers/vercel-gateway.ts` - Vercel AI Gateway (unified endpoint, zero markup)
- `src/providers/openrouter.ts` - OpenRouter client (unified gateway)
- `src/providers/vercel-ai.ts` - Vercel AI SDK wrapper (direct provider access)
- `src/types.ts` - Types and model mappings

### Provider Resolution Order

1. Check if preferred provider has API key
2. Fallback to Vercel AI Gateway if AI_GATEWAY_API_KEY exists (zero markup)
3. Fallback to OpenRouter if OPENROUTER_API_KEY exists
4. Try other providers with available keys

### Vercel AI Gateway

Zero-markup unified endpoint at `https://ai-gateway.vercel.sh/v1`:

```typescript
// Text models
"claude-sonnet-4", "gpt-4o", "gemini-2.0-flash", "grok-3"

// Image models (Google Imagen default)
"imagen-3", "imagen-3-fast", "dall-e-3", "flux-pro"

// Embeddings
"text-embedding-3-small", "text-embedding-3-large"
```

### OpenRouter Models

Popular models available through OpenRouter:

```typescript
// Anthropic
"claude-4-opus", "claude-sonnet-4", "claude-3.5-haiku"

// OpenAI
"gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "o3-mini"

// Google
"gemini-2.0-flash", "gemini-2.0-pro"

// Meta
"llama-3.3-70b", "llama-3.1-405b"

// DeepSeek
"deepseek-v3", "deepseek-r1"

// Image (Google Imagen default)
"imagen-3", "imagen-3-fast", "dall-e-3", "flux-pro"

// And 200+ more...
```

## Custom Configuration

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

## Dependencies

- `ai` ^4.0.0 - Vercel AI SDK
- `@ai-sdk/openai` ^1.0.0 - OpenAI provider
- `@ai-sdk/anthropic` ^1.0.0 - Anthropic provider
- `@ai-sdk/google` ^1.0.0 - Google provider
- `@elizaos/core` ^1.0.0 - ElizaOS runtime

## Deepwiki Repos

Use these exact repo names for Deepwiki research:

- Vercel AI SDK: `vercel/ai`
- ElizaOS: `elizaOS/eliza`
- OpenRouter: `OpenRouterTeam/openrouter-runner`

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
