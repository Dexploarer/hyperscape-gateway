/**
 * Vercel AI Gateway Provider
 *
 * Unified API endpoint for 200+ AI models with zero markup.
 * https://vercel.com/docs/ai-gateway
 *
 * Features:
 * - Single endpoint for all providers (OpenAI, Anthropic, Google, xAI, etc.)
 * - OpenAI-compatible API
 * - Text, embeddings, and image generation
 * - Automatic retries and load balancing
 * - Bring Your Own Key (BYOK) support
 */

import { generateText, streamText, embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAgentRuntime } from "@elizaos/core";
import type { TextGenerationParams, EmbeddingParams } from "../types";

const VERCEL_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

/** Models available through Vercel AI Gateway - November 2025 */
export const VERCEL_GATEWAY_MODELS = {
  // Anthropic
  "claude-4-opus": "anthropic/claude-4-opus",
  "claude-sonnet-4": "anthropic/claude-sonnet-4",
  "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
  "claude-3.5-haiku": "anthropic/claude-3.5-haiku",

  // OpenAI
  "gpt-5": "openai/gpt-5",
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "o1": "openai/o1",
  "o1-mini": "openai/o1-mini",
  "o3-mini": "openai/o3-mini",

  // Google
  "gemini-3-pro": "google/gemini-3-pro",
  "gemini-3-pro-image": "google/gemini-3-pro-image",
  "gemini-2.0-flash": "google/gemini-2.0-flash",
  "gemini-2.0-pro": "google/gemini-2.0-pro-exp",

  // xAI
  "grok-4": "xai/grok-4",
  "grok-3": "xai/grok-3",
  "grok-2": "xai/grok-2",

  // Meta Llama
  "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct",
  "llama-3.1-405b": "meta-llama/llama-3.1-405b-instruct",

  // Mistral
  "mistral-large": "mistralai/mistral-large-latest",
  "mistral-medium": "mistralai/mistral-medium-latest",

  // DeepSeek
  "deepseek-v3": "deepseek/deepseek-chat",
  "deepseek-r1": "deepseek/deepseek-r1",

  // Embeddings
  "text-embedding-3-small": "openai/text-embedding-3-small",
  "text-embedding-3-large": "openai/text-embedding-3-large",
  "embed-english-v3": "cohere/embed-english-v3.0",

  // Image Generation - Google Imagen (default)
  "imagen-3": "google/imagen-3.0-generate-001",
  "imagen-3-fast": "google/imagen-3.0-fast-generate-001",
  "imagen-3.0": "google/imagen-3.0-generate-002",

  // Image Generation - Other providers
  "dall-e-3": "openai/dall-e-3",
  "flux-pro": "black-forest-labs/flux-pro",
  "flux-schnell": "black-forest-labs/flux-schnell",
} as const;

/**
 * Get Vercel AI Gateway API key from runtime or environment
 */
function getVercelGatewayKey(runtime: IAgentRuntime): string {
  const key =
    (runtime.getSetting("AI_GATEWAY_API_KEY") as string) ||
    (runtime.getSetting("VERCEL_AI_GATEWAY_KEY") as string) ||
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_AI_GATEWAY_KEY;

  if (!key) {
    throw new Error("Missing AI_GATEWAY_API_KEY for Vercel AI Gateway");
  }
  return key;
}

/**
 * Create Vercel AI Gateway client using OpenAI-compatible interface
 */
function createVercelGatewayClient(apiKey: string) {
  return createOpenAI({
    apiKey,
    baseURL: VERCEL_GATEWAY_BASE_URL,
  });
}

/**
 * Resolve model alias to full model ID
 */
function resolveModel(model: string): string {
  return (
    VERCEL_GATEWAY_MODELS[model as keyof typeof VERCEL_GATEWAY_MODELS] || model
  );
}

/**
 * Generate text using Vercel AI Gateway
 */
export async function generateTextWithVercelGateway(
  runtime: IAgentRuntime,
  model: string,
  params: TextGenerationParams
): Promise<string> {
  const apiKey = getVercelGatewayKey(runtime);
  const client = createVercelGatewayClient(apiKey);
  const modelId = resolveModel(model);

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
 * Stream text using Vercel AI Gateway
 */
export async function streamTextWithVercelGateway(
  runtime: IAgentRuntime,
  model: string,
  params: TextGenerationParams,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = getVercelGatewayKey(runtime);
  const client = createVercelGatewayClient(apiKey);
  const modelId = resolveModel(model);

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
 * Generate embeddings using Vercel AI Gateway
 */
export async function generateEmbeddingWithVercelGateway(
  runtime: IAgentRuntime,
  model: string,
  params: EmbeddingParams
): Promise<number[]> {
  const apiKey = getVercelGatewayKey(runtime);
  const client = createVercelGatewayClient(apiKey);
  const modelId = resolveModel(model);

  const text = Array.isArray(params.text) ? params.text[0] : params.text;

  const { embedding } = await embed({
    model: client.textEmbeddingModel(modelId),
    value: text,
  });

  return embedding;
}

/**
 * Generate image using Vercel AI Gateway
 * Supports DALL-E 3, FLUX, Imagen, and other image models
 */
export async function generateImageWithVercelGateway(
  runtime: IAgentRuntime,
  model: string,
  prompt: string,
  options?: {
    size?: string;
    quality?: string;
    style?: string;
    n?: number;
  }
): Promise<string> {
  const apiKey = getVercelGatewayKey(runtime);
  const modelId = resolveModel(model);

  // Use OpenAI-compatible images endpoint
  const response = await fetch(
    `${VERCEL_GATEWAY_BASE_URL}/images/generations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        prompt,
        size: options?.size || "1024x1024",
        quality: options?.quality || "standard",
        style: options?.style || "vivid",
        n: options?.n || 1,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel AI Gateway image generation failed: ${error}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };

  return data.data?.[0]?.url || data.data?.[0]?.b64_json || "";
}

/**
 * Generate image using multimodal model (e.g., Gemini 3 Pro Image)
 * These models use text generation with image output
 */
export async function generateImageWithMultimodal(
  runtime: IAgentRuntime,
  model: string,
  prompt: string
): Promise<string> {
  const apiKey = getVercelGatewayKey(runtime);
  const client = createVercelGatewayClient(apiKey);
  const modelId = resolveModel(model);

  // Multimodal models like Gemini can generate images via text generation
  const { text } = await generateText({
    model: client(modelId),
    prompt: `Generate an image: ${prompt}`,
  });

  // The response may contain base64 image data or URL
  return text;
}
