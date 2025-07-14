import { useState, useEffect, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Card } from "./ui/card";
import { SuggestionData } from "../api/types/suggestion";
import { CustomTooltip } from "./CustomTooltip";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#8dd1e1",
  "#d084d0",
  "#87ceeb",
  "#98fb98",
  "#f0e68c",
  "#dda0dd",
];

// 1. Language Performance Donut Chart
interface LanguagePerformanceProps {
  suggestions: SuggestionData[];
  title?: string;
}

const LanguagePerformance: React.FC<LanguagePerformanceProps> = ({
  suggestions,
  title = "Performance by Language",
}) => {
  const [textColor, setTextColor] = useState("#000000");

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTextColor(isDarkMode ? "#FFFFFF" : "#000000");
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!suggestions.length) return { labels: [], data: [], accuracies: [] };

    const languageStats = suggestions.reduce(
      (acc, suggestion) => {
        const language = suggestion.language || "Unknown";

        if (!acc[language]) {
          acc[language] = { total: 0, correct: 0 };
        }

        acc[language].total++;
        if (suggestion.hasBug === false) {
          acc[language].correct++;
        }

        return acc;
      },
      {} as { [key: string]: { total: number; correct: number } }
    );

    const sortedEntries = Object.entries(languageStats)
      .map(([language, stats]) => ({
        name: language,
        value: stats.total,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        correct: stats.correct,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      labels: sortedEntries.map((entry) => entry.name),
      data: sortedEntries.map((entry) => entry.value),
      accuracies: sortedEntries.map((entry) => entry.accuracy),
      entries: sortedEntries,
    };
  }, [suggestions]);

  if (!chartData.labels.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CustomTooltip
            trigger={
              <span className="text-lg font-semibold text-alpha">{title}</span>
            }
            children={
              <div className="space-y-2">
                <p className="text-sm">
                  This donut chart shows your performance across different
                  programming languages.
                </p>
                <p className="text-xs text-muted-foreground">
                  The size of each slice represents usage volume, and accuracy
                  percentages are shown in the legend.
                </p>
              </div>
            }
          />
        </div>
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          No language data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <CustomTooltip
          trigger={
            <span className="text-lg font-semibold text-alpha">{title}</span>
          }
          children={
            <div className="space-y-2">
              <p className="text-sm">
                This donut chart shows your performance across different
                programming languages.
              </p>
              <p className="text-xs text-muted-foreground">
                The size of each slice represents usage volume, and accuracy
                percentages are shown in the legend.
              </p>
            </div>
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="w-3/5 h-60">
          <Pie
            data={{
              labels: chartData.labels as string[],
              datasets: [
                {
                  data: chartData.data,
                  backgroundColor: COLORS,
                  borderColor: "#ffffff",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false, // We'll show custom legend
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const entry = chartData.entries?.[context.dataIndex];
                      if (!entry) return "";
                      return `${entry.name}: ${entry.value} suggestions (${entry.accuracy.toFixed(1)}% accuracy)`;
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div className="w-2/5 pl-4">
          <h4 className="font-medium mb-2" style={{ color: textColor }}>
            Languages
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {chartData?.entries?.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded mr-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="flex-1 truncate" style={{ color: textColor }}>
                  {entry.name}
                </span>
                <span className="text-muted-foreground text-xs ml-2">
                  {entry.accuracy.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export { LanguagePerformance };
