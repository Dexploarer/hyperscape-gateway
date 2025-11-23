/**
 * Vercel AI SDK Provider
 *
 * Unified interface for multiple LLM providers using Vercel AI SDK.
 * Supports OpenAI, Anthropic, Google, and more.
 */

import { generateText, streamText, embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { IAgentRuntime } from "@elizaos/core";
import type {
  ModelProviderName,
  TextGenerationParams,
  EmbeddingParams,
} from "../types";
import { PROVIDER_MODELS, ENV_KEYS } from "../types";

/**
 * Get API key for a provider from runtime settings or environment
 */
function getApiKey(
  runtime: IAgentRuntime,
  provider: ModelProviderName
): string | undefined {
  const envKey = ENV_KEYS[provider];
  return (
    (runtime.getSetting(envKey) as string) ||
    process.env[envKey]
  );
}

/**
 * Create a provider instance based on the provider name
 */
function createProvider(
  provider: ModelProviderName,
  apiKey: string
) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "google":
      return createGoogleGenerativeAI({ apiKey });
    case "groq":
      return createOpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    case "together":
      return createOpenAI({
        apiKey,
        baseURL: "https://api.together.xyz/v1",
      });
    case "fireworks":
      return createOpenAI({
        apiKey,
        baseURL: "https://api.fireworks.ai/inference/v1",
      });
    case "mistral":
      return createOpenAI({
        apiKey,
        baseURL: "https://api.mistral.ai/v1",
      });
    case "perplexity":
      return createOpenAI({
        apiKey,
        baseURL: "https://api.perplexity.ai",
      });
    default:
      return createOpenAI({ apiKey });
  }
}

/**
 * Get model string for a provider and model type
 */
function getModelString(
  provider: ModelProviderName,
  modelType: keyof typeof PROVIDER_MODELS.openai,
  customModel?: string
): string {
  if (customModel) return customModel;

  const models = PROVIDER_MODELS[provider];
  return models?.[modelType] || PROVIDER_MODELS.openai[modelType];
}

/**
 * Generate text using Vercel AI SDK
 */
export async function generateTextWithVercel(
  runtime: IAgentRuntime,
  provider: ModelProviderName,
  modelType: "textLarge" | "textSmall",
  params: TextGenerationParams
): Promise<string> {
  const apiKey = getApiKey(runtime, provider);
  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`);
  }

  const providerInstance = createProvider(provider, apiKey);
  const modelName = getModelString(provider, modelType);

  const { text } = await generateText({
    model: providerInstance(modelName),
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
 * Stream text using Vercel AI SDK
 */
export async function streamTextWithVercel(
  runtime: IAgentRuntime,
  provider: ModelProviderName,
  modelType: "textLarge" | "textSmall",
  params: TextGenerationParams,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = getApiKey(runtime, provider);
  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`);
  }

  const providerInstance = createProvider(provider, apiKey);
  const modelName = getModelString(provider, modelType);

  const result = streamText({
    model: providerInstance(modelName),
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
 * Generate embeddings using Vercel AI SDK
 */
export async function generateEmbeddingWithVercel(
  runtime: IAgentRuntime,
  provider: ModelProviderName,
  params: EmbeddingParams
): Promise<number[]> {
  const apiKey = getApiKey(runtime, provider);
  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`);
  }

  const providerInstance = createProvider(provider, apiKey);
  const modelName = getModelString(provider, "embedding");

  if (!modelName) {
    throw new Error(`Provider ${provider} does not support embeddings`);
  }

  const text = Array.isArray(params.text) ? params.text[0] : params.text;

  const { embedding } = await embed({
    model: providerInstance.textEmbeddingModel(modelName),
    value: text,
  });

  return embedding;
}

// Re-export ENV_KEYS and PROVIDER_MODELS for use in other files
export { ENV_KEYS, PROVIDER_MODELS } from "../types";
