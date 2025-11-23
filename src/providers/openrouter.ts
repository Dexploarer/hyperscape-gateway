/**
 * OpenRouter Provider
 *
 * Unified gateway to 200+ models from all major providers.
 * Uses OpenAI-compatible API with model routing.
 */

import { generateText, streamText, embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAgentRuntime } from "@elizaos/core";
import type { TextGenerationParams, EmbeddingParams } from "../types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/** Popular models available through OpenRouter - November 2025 */
export const OPENROUTER_MODELS = {
  // Anthropic
  "claude-4-opus": "anthropic/claude-4-opus",
  "claude-sonnet-4": "anthropic/claude-sonnet-4",
  "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
  "claude-3.5-haiku": "anthropic/claude-3-5-haiku",

  // OpenAI
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "o1": "openai/o1",
  "o1-mini": "openai/o1-mini",
  "o3-mini": "openai/o3-mini",

  // Google
  "gemini-2.0-flash": "google/gemini-2.0-flash-001",
  "gemini-2.0-pro": "google/gemini-2.0-pro-exp",
  "gemini-1.5-pro": "google/gemini-pro-1.5",

  // Meta Llama
  "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct",
  "llama-3.1-405b": "meta-llama/llama-3.1-405b-instruct",
  "llama-3.1-70b": "meta-llama/llama-3.1-70b-instruct",
  "llama-3.1-8b": "meta-llama/llama-3.1-8b-instruct",

  // Mistral
  "mistral-large": "mistralai/mistral-large",
  "mistral-medium": "mistralai/mistral-medium",
  "mixtral-8x22b": "mistralai/mixtral-8x22b-instruct",

  // DeepSeek
  "deepseek-v3": "deepseek/deepseek-chat",
  "deepseek-r1": "deepseek/deepseek-r1",
  "deepseek-coder": "deepseek/deepseek-coder",

  // Qwen
  "qwen-2.5-72b": "qwen/qwen-2.5-72b-instruct",
  "qwen-2.5-coder-32b": "qwen/qwen-2.5-coder-32b-instruct",

  // Embeddings
  "text-embedding-3-small": "openai/text-embedding-3-small",
  "text-embedding-3-large": "openai/text-embedding-3-large",

  // Image generation - Google Imagen (default)
  "imagen-3": "google/imagen-3.0-generate-001",
  "imagen-3-fast": "google/imagen-3.0-fast-generate-001",

  // Image generation - Other providers
  "dall-e-3": "openai/dall-e-3",
  "flux-schnell": "black-forest-labs/flux-schnell",
  "flux-pro": "black-forest-labs/flux-pro",
} as const;

/**
 * Get OpenRouter API key from runtime or environment
 */
function getOpenRouterKey(runtime: IAgentRuntime): string {
  const key =
    (runtime.getSetting("OPENROUTER_API_KEY") as string) ||
    process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }
  return key;
}

/**
 * Create OpenRouter client using OpenAI-compatible interface
 */
function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    headers: {
      "HTTP-Referer": "https://hyperscape.game",
      "X-Title": "Hyperscape AI Gateway",
    },
  });
}

/**
 * Generate text using OpenRouter
 */
export async function generateTextWithOpenRouter(
  runtime: IAgentRuntime,
  model: string,
  params: TextGenerationParams
): Promise<string> {
  const apiKey = getOpenRouterKey(runtime);
  const client = createOpenRouterClient(apiKey);

  // Resolve model alias if provided
  const modelId =
    OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS] || model;

  const { text } = await generateText({
    model: client(modelId),
    prompt: params.prompt,
    system: params.system,
    maxTokens: params.maxTokens,
    temperature: params.temperature,
    topP: params.topP,
    stopSequences: params.stopSequences,
  });

  return text;
}

/**
 * Stream text using OpenRouter
 */
export async function streamTextWithOpenRouter(
  runtime: IAgentRuntime,
  model: string,
  params: TextGenerationParams,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = getOpenRouterKey(runtime);
  const client = createOpenRouterClient(apiKey);

  const modelId =
    OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS] || model;

  const result = streamText({
    model: client(modelId),
    prompt: params.prompt,
    system: params.system,
    maxTokens: params.maxTokens,
    temperature: params.temperature,
    topP: params.topP,
    stopSequences: params.stopSequences,
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
    onChunk?.(chunk);
  }

  return fullText;
}

/**
 * Generate embeddings using OpenRouter
 */
export async function generateEmbeddingWithOpenRouter(
  runtime: IAgentRuntime,
  model: string,
  params: EmbeddingParams
): Promise<number[]> {
  const apiKey = getOpenRouterKey(runtime);
  const client = createOpenRouterClient(apiKey);

  const modelId =
    OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS] || model;

  const text = Array.isArray(params.text) ? params.text[0] : params.text;

  const { embedding } = await embed({
    model: client.textEmbeddingModel(modelId),
    value: text,
  });

  return embedding;
}

/**
 * Generate image using OpenRouter (via DALL-E or FLUX)
 */
export async function generateImageWithOpenRouter(
  runtime: IAgentRuntime,
  model: string,
  prompt: string,
  options?: {
    size?: string;
    quality?: string;
    n?: number;
  }
): Promise<string> {
  const apiKey = getOpenRouterKey(runtime);

  const modelId =
    OPENROUTER_MODELS[model as keyof typeof OPENROUTER_MODELS] || model;

  // OpenRouter uses standard OpenAI image API for DALL-E
  const response = await fetch(`${OPENROUTER_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://hyperscape.game",
      "X-Title": "Hyperscape AI Gateway",
    },
    body: JSON.stringify({
      model: modelId,
      prompt,
      size: options?.size || "1024x1024",
      quality: options?.quality || "standard",
      n: options?.n || 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter image generation failed: ${error}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };
  return data.data?.[0]?.url || data.data?.[0]?.b64_json || "";
}
