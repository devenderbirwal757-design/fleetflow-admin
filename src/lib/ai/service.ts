import { getModel } from "./client";
import { checkRateLimit } from "./rate-limiter";
import {
  expenseAnalysisPrompt,
  profitLossPrompt,
  monthlySummaryPrompt,
  operationalInsightsPrompt,
} from "./prompts";
import type {
  AIResponse,
  ExpenseAnalysis,
  ProfitLoss,
  MonthlySummary,
} from "./types";
import type { GenerativeModel } from "@google/generative-ai";

function parseJSON<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*$/g, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function safeGenerate(
  model: GenerativeModel,
  prompt: string
): Promise<string> {
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function analyzeExpenses(
  expenses: { category: string; amount: number; date: string }[]
): Promise<AIResponse<ExpenseAnalysis>> {
  const rateLimit = checkRateLimit("expense-analysis");
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit reached. Try again in ${Math.ceil(rateLimit.resetIn / 1000)}s.`,
    };
  }

  if (expenses.length === 0) {
    return {
      success: false,
      error: "No expense data to analyze.",
    };
  }

  try {
    const model = getModel();
    const prompt = expenseAnalysisPrompt(expenses);
    const text = await safeGenerate(model, prompt);
    const data = parseJSON<ExpenseAnalysis>(text);

    if (!data) {
      return { success: false, error: "Failed to parse AI response." };
    }
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI service error",
    };
  }
}

export async function calculateProfitLoss(data: {
  trips: { total_amount: number; status: string }[];
  expenses: { category: string; amount: number }[];
  payments: { amount: number; payment_status: string }[];
}): Promise<AIResponse<ProfitLoss>> {
  const rateLimit = checkRateLimit("profit-loss");
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit reached. Try again in ${Math.ceil(rateLimit.resetIn / 1000)}s.`,
    };
  }

  try {
    const model = getModel();
    const prompt = profitLossPrompt(data);
    const text = await safeGenerate(model, prompt);
    const parsed = parseJSON<ProfitLoss>(text);

    if (!parsed) {
      return { success: false, error: "Failed to parse AI response." };
    }
    return { success: true, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI service error",
    };
  }
}

export async function generateMonthlySummary(data: {
  month: string;
  year: number;
  trips: { total_amount: number; status: string }[];
  expenses: { category: string; amount: number }[];
  payments: { amount: number }[];
  driverCount: number;
  vehicleCount: number;
}): Promise<AIResponse<MonthlySummary>> {
  const rateLimit = checkRateLimit("monthly-summary");
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit reached. Try again in ${Math.ceil(rateLimit.resetIn / 1000)}s.`,
    };
  }

  try {
    const model = getModel();
    const prompt = monthlySummaryPrompt(data);
    const text = await safeGenerate(model, prompt);
    const parsed = parseJSON<MonthlySummary>(text);

    if (!parsed) {
      return { success: false, error: "Failed to parse AI response." };
    }
    return { success: true, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI service error",
    };
  }
}

export async function getOperationalInsights(data: {
  totalTrips: number;
  totalDrivers: number;
  totalVehicles: number;
  activeTrips: number;
  availableDrivers: number;
  availableVehicles: number;
  recentCompletionRate: number;
  expenseRatio: number;
}): Promise<
  AIResponse<{
    summary: string;
    metrics: Array<{
      label: string;
      value: string;
      status: "good" | "warning" | "critical";
      suggestion: string;
    }>;
    recommendations: string[];
  }>
> {
  const rateLimit = checkRateLimit("operational-insights");
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit reached. Try again in ${Math.ceil(rateLimit.resetIn / 1000)}s.`,
    };
  }

  try {
    const model = getModel();
    const prompt = operationalInsightsPrompt(data);
    const text = await safeGenerate(model, prompt);
    const parsed = parseJSON<{
      summary: string;
      metrics: Array<{
        label: string;
        value: string;
        status: "good" | "warning" | "critical";
        suggestion: string;
      }>;
      recommendations: string[];
    }>(text);

    if (!parsed) {
      return { success: false, error: "Failed to parse AI response." };
    }
    return { success: true, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI service error",
    };
  }
}
