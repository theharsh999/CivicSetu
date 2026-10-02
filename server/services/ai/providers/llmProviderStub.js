/**
 * LLM Provider Stub (Provider ID: llm-gemini-stub)
 *
 * ARCHITECTURAL EXTENSION POINT:
 * This file demonstrates how a Large Language Model (e.g. Google Gemini 1.5 Flash / Pro
 * or OpenAI GPT-4o-mini) can be plugged into CivicSetu with zero modifications to controllers,
 * routing services, or UI components.
 *
 * TO ACTIVATE A REAL LLM IN FUTURE ITERATIONS:
 * 1. Set GEMINI_API_KEY in server/.env
 * 2. Set AI_PROVIDER=gemini in server/.env
 * 3. Use @google/genai or langchain to prompt the model with system instructions returning
 *    the exact JSON schema documented below.
 */

import { ApiError } from '../../../utils/ApiError.js';

/**
 * Standard Provider Contract:
 * @param {Object} input - { title, description, location }
 * @returns {Promise<Object>} {
 *   department: string (DEPARTMENTS code),
 *   category: string,
 *   priority: string (Low|Medium|High|Critical),
 *   confidence: number (0.0 to 1.0),
 *   keywords: string[],
 *   urgencySignals: string[],
 *   needsManualReview: boolean,
 *   summary: string,
 *   reasoning: string,
 *   alternatives: Array<{ department: string, category: string, confidence: number }>,
 *   provider: string,
 *   isMock: boolean
 * }
 */
export const analyze = async ({ title, description, location }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw ApiError.badRequest(
      'LLM provider is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY in environment to enable neural model analysis.'
    );
  }

  // Example LLM integration prompt template:
  /*
  const prompt = `
    You are an automated civic triage classifier for municipal corporations.
    Analyze the citizen grievance below and respond strictly in JSON matching the schema:
    Grievance Headline: ${title}
    Description: ${description}
    Ward: ${location?.ward || 'Unknown'}
  `;
  */

  throw ApiError.internal('LLM Provider Stub: Live API call is deliberately not executed in prototype mode.');
};

export default {
  analyze,
};
