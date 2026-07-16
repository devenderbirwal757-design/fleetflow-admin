const SYSTEM_BASE =
  "You are an AI assistant for FleetFlow, a transport management dashboard. " +
  "Analyze the provided data and respond with concise, actionable insights in JSON format. " +
  "Do not include markdown code blocks or extra commentary — return only valid JSON.";

export function expenseAnalysisPrompt(
  expenses: { category: string; amount: number; date: string }[]
): string {
  return (
    SYSTEM_BASE +
    "\n\n" +
    "Analyze these transport expense records. Identify spending patterns, anomalies, " +
    "and provide cost-saving recommendations.\n\n" +
    "Respond with JSON matching: { summary: string, totalExpenses: number, " +
    "categoryBreakdown: [{ category: string, amount: number, percentage: number }], " +
    "topCategory: string, anomalyFlags: string[], recommendations: string[] }\n\n" +
    "Expenses:\n" +
    JSON.stringify(expenses, null, 2)
  );
}

export function profitLossPrompt(data: {
  trips: { total_amount: number; status: string }[];
  expenses: { category: string; amount: number }[];
  payments: { amount: number; payment_status: string }[];
}): string {
  return (
    SYSTEM_BASE +
    "\n\n" +
    "Calculate profit/loss from these trip and expense records. " +
    "Revenue comes from completed trips (total_amount). " +
    "Costs come from expenses.\n\n" +
    "Respond with JSON matching: { period: string, totalRevenue: number, " +
    "totalExpenses: number, netProfit: number, profitMargin: number, " +
    "breakdown: { revenue: { trips: number, other: number }, expenses: object }, " +
    "assessment: string, suggestions: string[] }\n\n" +
    "Data:\n" +
    JSON.stringify(data, null, 2)
  );
}

export function monthlySummaryPrompt(data: {
  month: string;
  year: number;
  trips: { total_amount: number; status: string }[];
  expenses: { category: string; amount: number }[];
  payments: { amount: number }[];
  driverCount: number;
  vehicleCount: number;
}): string {
  return (
    SYSTEM_BASE +
    "\n\n" +
    "Generate a monthly operational summary with key metrics and observations.\n\n" +
    "Respond with JSON matching: { month: string, year: number, " +
    "tripsCompleted: number, totalRevenue: number, totalExpenses: number, " +
    "netProfit: number, topPerformer: string, highlights: string[], concerns: string[] }\n\n" +
    "Data:\n" +
    JSON.stringify(data, null, 2)
  );
}

export function operationalInsightsPrompt(data: {
  totalTrips: number;
  totalDrivers: number;
  totalVehicles: number;
  activeTrips: number;
  availableDrivers: number;
  availableVehicles: number;
  recentCompletionRate: number;
  expenseRatio: number;
}): string {
  return (
    SYSTEM_BASE +
    "\n\n" +
    "Analyze these operational metrics and provide actionable insights " +
    "to improve fleet efficiency, reduce costs, and optimize resource allocation.\n\n" +
    "Respond with JSON matching: { summary: string, metrics: " +
    "[{ label: string, value: string, status: 'good' | 'warning' | 'critical', " +
    "suggestion: string }], recommendations: string[] }\n\n" +
    "Data:\n" +
    JSON.stringify(data, null, 2)
  );
}
