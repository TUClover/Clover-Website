import { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { CustomTooltip } from "@/components/CustomTooltip";
import { Card } from "@/components/ui/card";
import { UserActivityLogItem } from "@/api/types/suggestion";

interface LearningProgressProps {
  userActivity: UserActivityLogItem[];
  windowSize?: number;
  title?: string;
}

const LearningProgressChart = ({
  userActivity,
  windowSize = 20,
  title = "Learning Progress",
}: LearningProgressProps) => {
  const [textColor, setTextColor] = useState("#000000");
  const [gridColor, setGridColor] = useState("rgba(255,255,255,0.1)");

  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTextColor(isDarkMode ? "#FFFFFF" : "#000000");
      setGridColor(isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)");
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
    if (!userActivity.length) return { labels: [], data: [] };

    const sortedActivity = [...userActivity].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const labels: number[] = [];
    const data: number[] = [];

    sortedActivity.forEach((log, index) => {
      const startIndex = Math.max(0, index - windowSize + 1);
      const windowLogs = sortedActivity.slice(startIndex, index + 1);

      const correct = windowLogs.filter((l) => l.hasBug === false).length;
      const rollingAccuracy = (correct / windowLogs.length) * 100;

      labels.push(index + 1);
      data.push(rollingAccuracy);
    });

    return { labels, data };
  }, [userActivity, windowSize]);

  if (!chartData.labels.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CustomTooltip
            trigger={
              <h2 className="text-lg font-semibold text-alpha">{title}</h2>
            }
            children={
              <div className="space-y-2">
                <p className="text-sm">
                  This chart shows your learning progress using a rolling{" "}
                  <span className="font-semibold text-alpha">
                    {windowSize}-suggestion
                  </span>{" "}
                  average accuracy.
                </p>
                <p className="text-xs text-muted-foreground">
                  An upward trend indicates improving ability to identify
                  correct suggestions.
                </p>
              </div>
            }
          />
        </div>
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          No activity data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <CustomTooltip
          trigger={
            <h2 className="text-lg font-semibold text-alpha">{title}</h2>
          }
          children={
            <div className="space-y-2">
              <p className="text-sm">
                This chart shows your learning progress using a rolling{" "}
                <span className="font-semibold text-alpha">
                  {windowSize}-suggestion
                </span>{" "}
                average accuracy.
              </p>
              <p className="text-xs text-muted-foreground">
                An upward trend indicates improving ability to identify correct
                suggestions.
              </p>
            </div>
          }
        />
      </div>

      <div className="relative w-full h-60 md:h-64 lg:h-72">
        <Line
          data={{
            labels: chartData.labels,
            datasets: [
              {
                label: "Rolling Accuracy (%)",
                data: chartData.data,
                borderColor: "#82ca9d",
                backgroundColor: "#82ca9d",
                borderWidth: 3,
                tension: 0.3,
                fill: false,
                pointBackgroundColor: "#82ca9d",
                pointBorderColor: "#FFFFFF",
                pointBorderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 6,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: textColor },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `Accuracy: ${context.parsed.y.toFixed(1)}%`;
                  },
                  title: function (context) {
                    return `Suggestion #${context[0].label}`;
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: { color: textColor },
                grid: { color: gridColor },
                title: {
                  display: true,
                  text: "Number of Suggestions",
                  color: textColor,
                },
              },
              y: {
                beginAtZero: true,
                max: 120,
                ticks: {
                  color: textColor,
                  callback: function (value) {
                    if (value === 120) return "";
                    return value + "%";
                  },
                },
                grid: { color: gridColor },
                title: {
                  display: true,
                  text: "Accuracy (%)",
                  color: textColor,
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default LearningProgressChart;
