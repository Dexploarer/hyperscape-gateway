/**
 * Gateway Providers
 */

export {
  generateTextWithVercel,
  streamTextWithVercel,
  generateEmbeddingWithVercel,
} from "./vercel-ai";

export {
  generateTextWithOpenRouter,
  streamTextWithOpenRouter,
  generateEmbeddingWithOpenRouter,
  generateImageWithOpenRouter,
  OPENROUTER_MODELS,
} from "./openrouter";

export {
  generateTextWithVercelGateway,
  streamTextWithVercelGateway,
  generateEmbeddingWithVercelGateway,
  generateImageWithVercelGateway,
  generateImageWithMultimodal,
  VERCEL_GATEWAY_MODELS,
} from "./vercel-gateway";
