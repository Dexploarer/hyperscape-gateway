/**
 * Hyperscape Gateway Types
 */

export type ModelProviderName =
  | "openai"
  | "anthropic"
  | "google"
  | "openrouter"
  | "vercel-gateway"
  | "groq"
  | "together"
  | "fireworks"
  | "mistral"
  | "cohere"
  | "perplexity";

export interface GatewayConfig {
  /** Default provider for text generation */
  defaultTextProvider: ModelProviderName;
  /** Default provider for embeddings */
  defaultEmbeddingProvider: ModelProviderName;
  /** Default provider for image generation */
  defaultImageProvider: ModelProviderName;
  /** Model mappings for each type */
  models: {
    textLarge?: string;
    textSmall?: string;
    embedding?: string;
    image?: string;
  };
  /** Provider-specific API keys (fallback to env vars) */
  apiKeys?: Partial<Record<ModelProviderName, string>>;
}

export interface TextGenerationParams {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  responseFormat?: "text" | "json";
}

export interface EmbeddingParams {
  text: string | string[];
}

export interface ImageGenerationParams {
  prompt: string;
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
}

export interface StreamTextParams extends TextGenerationParams {
  onChunk?: (chunk: string) => void;
  onFinish?: (fullText: string) => void;
}

/** Provider model mappings - November 2025 */
export const PROVIDER_MODELS = {
  openai: {
    textLarge: "gpt-4o",
    textSmall: "gpt-4o-mini",
    embedding: "text-embedding-3-small",
    image: "dall-e-3",
  },
  anthropic: {
    textLarge: "claude-sonnet-4-20250514",
    textSmall: "claude-3-5-haiku-20241022",
    embedding: null, // Anthropic doesn't have embeddings
    image: null,
  },
  google: {
    textLarge: "gemini-2.0-flash",
    textSmall: "gemini-2.0-flash-lite",
    embedding: "text-embedding-004",
    image: "imagen-3.0-generate-001",
  },
  openrouter: {
    textLarge: "anthropic/claude-sonnet-4",
    textSmall: "anthropic/claude-3-5-haiku",
    embedding: "openai/text-embedding-3-small",
    image: "google/imagen-3.0-generate-001",
  },
  "vercel-gateway": {
    textLarge: "anthropic/claude-sonnet-4",
    textSmall: "openai/gpt-4o-mini",
    embedding: "openai/text-embedding-3-small",
    image: "google/imagen-3.0-generate-001",
  },
  groq: {
    textLarge: "llama-3.3-70b-versatile",
    textSmall: "llama-3.1-8b-instant",
    embedding: null,
    image: null,
  },
  together: {
    textLarge: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    textSmall: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    embedding: "togethercomputer/m2-bert-80M-8k-retrieval",
    image: "black-forest-labs/FLUX.1-schnell",
  },
  fireworks: {
    textLarge: "accounts/fireworks/models/llama-v3p1-70b-instruct",
    textSmall: "accounts/fireworks/models/llama-v3p1-8b-instruct",
    embedding: "nomic-ai/nomic-embed-text-v1.5",
    image: "accounts/fireworks/models/flux-1-schnell",
  },
  mistral: {
    textLarge: "mistral-large-latest",
    textSmall: "mistral-small-latest",
    embedding: "mistral-embed",
    image: null,
  },
  cohere: {
    textLarge: "command-r-plus",
    textSmall: "command-r",
    embedding: "embed-english-v3.0",
    image: null,
  },
  perplexity: {
    textLarge: "llama-3.1-sonar-large-128k-online",
    textSmall: "llama-3.1-sonar-small-128k-online",
    embedding: null,
    image: null,
  },
} as const;

/** Environment variable names for API keys */
export const ENV_KEYS: Record<ModelProviderName, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  "vercel-gateway": "AI_GATEWAY_API_KEY",
  groq: "GROQ_API_KEY",
  together: "TOGETHER_API_KEY",
  fireworks: "FIREWORKS_API_KEY",
  mistral: "MISTRAL_API_KEY",
  cohere: "COHERE_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
};
