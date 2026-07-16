"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle, Lightbulb, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiInsightCardProps {
  title: string;
  description?: string;
  onGenerate: () => Promise<{ success: boolean; error?: string; data?: unknown }>;
  children: (data: unknown) => React.ReactNode;
  icon?: React.ReactNode;
}

export function AiInsightCard({
  title,
  description,
  onGenerate,
  children,
  icon,
}: AiInsightCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await onGenerate();
    setLoading(false);

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error ?? "Failed to generate insights");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {icon ?? <Sparkles className="h-5 w-5 text-amber-500" />}
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {loading ? "Analyzing..." : data ? "Refresh" : "Analyze"}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        {loading && !data && (
          <div className="flex flex-col items-center gap-2 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Generating insights...</p>
          </div>
        )}
        {!loading && !data && !error && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Lightbulb className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Click <strong>Analyze</strong> to generate AI-powered insights
            </p>
          </div>
        )}
        {data && !loading && children(data)}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: "good" | "warning" | "critical" }) {
  const config = {
    good: { icon: TrendingUp, className: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
    warning: { icon: Minus, className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
    critical: { icon: TrendingDown, className: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400" },
  };

  const { icon: Icon, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
