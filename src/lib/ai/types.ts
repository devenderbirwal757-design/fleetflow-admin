export type AIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface ExpenseAnalysis {
  summary: string;
  totalExpenses: number;
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  topCategory: string;
  anomalyFlags: string[];
  recommendations: string[];
}

export interface ProfitLoss {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  breakdown: {
    revenue: { trips: number; other: number };
    expenses: Record<string, number>;
  };
  assessment: string;
  suggestions: string[];
}

export interface MonthlySummary {
  month: string;
  year: number;
  tripsCompleted: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  topPerformer: string;
  highlights: string[];
  concerns: string[];
}
