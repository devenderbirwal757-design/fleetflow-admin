import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/config/env";

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient() {
  if (!env.gemini.apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.gemini.apiKey);
  }
  return genAI;
}

export function getModel() {
  const client = getGeminiClient();
  return client.getGenerativeModel({ model: "gemini-2.5-flash" });
}
