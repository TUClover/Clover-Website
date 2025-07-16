import { InstructorLogResponse } from "@/api/classes";
import { UserActivityLogItem } from "@/types/suggestion";
import { CustomTooltip } from "@/components/CustomTooltip";
import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";

interface ResponseTimeAnalysisProps {
  userActivity: UserActivityLogItem[] | InstructorLogResponse[];
  title?: string;
}
const ResponseTimeBarChart = ({
  userActivity,
  title,
}: ResponseTimeAnalysisProps) => {
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
    if (!userActivity.length)
      return { labels: [], data: [], backgroundColors: [], counts: [] };

    // Normalize the data - handle both UserActivityLogItem and InstructorLogResponse
    const normalizedActivity = userActivity.map((log) => ({
      ...log,
      hasBug: log.hasBug ?? false, // Handle potential undefined
      event: log.event || "", // Ensure event exists
      duration: log.duration || 0, // Ensure duration exists
    }));

    const correctSuggestions = normalizedActivity.filter(
      (log) => log.hasBug === false
    );
    const incorrectSuggestions = normalizedActivity.filter(
      (log) => log.hasBug === true
    );
    const acceptedSuggestions = normalizedActivity.filter((log) =>
      log.event.includes("ACCEPT")
    );
    const rejectedSuggestions = normalizedActivity.filter((log) =>
      log.event.includes("REJECT")
    );

    const avgDuration = (logs: typeof normalizedActivity) =>
      logs.length > 0
        ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length
        : 0;

    const categories = [
      {
        category: "Correct",
        avgTime: avgDuration(correctSuggestions),
        count: correctSuggestions.length,
        color: "#82ca9d",
      },
      {
        category: "Incorrect",
        avgTime: avgDuration(incorrectSuggestions),
        count: incorrectSuggestions.length,
        color: "#ff7300",
      },
      {
        category: "Accepted",
        avgTime: avgDuration(acceptedSuggestions),
        count: acceptedSuggestions.length,
        color: "#8884d8",
      },
      {
        category: "Rejected",
        avgTime: avgDuration(rejectedSuggestions),
        count: rejectedSuggestions.length,
        color: "#ffc658",
      },
    ].filter((item) => item.count > 0);

    return {
      labels: categories.map((item) => item.category),
      data: categories.map((item) => item.avgTime),
      backgroundColors: categories.map((item) => item.color),
      counts: categories.map((item) => item.count),
    };
  }, [userActivity]);

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
                  This chart shows average response times for different
                  categories.
                </p>
              </div>
            }
          />
        </div>
        <div className="flex items-center justify-center h-60 text-muted-foreground">
          No response time data available
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
                This chart compares your average{" "}
                <span className="font-semibold text-alpha">response times</span>{" "}
                across different suggestion categories.
              </p>
              <p className="text-xs text-muted-foreground">
                Faster response times might indicate more confidence in your
                decisions.
              </p>
            </div>
          }
        />
      </div>

      <div className="relative w-full h-60 md:h-64 lg:h-72">
        <Bar
          data={{
            labels: chartData.labels,
            datasets: [
              {
                label: "Average Response Time (ms)",
                data: chartData.data,
                backgroundColor: chartData.backgroundColors,
                borderColor: chartData.backgroundColors,
                borderWidth: 1,
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
                    const count = chartData.counts[context.dataIndex];
                    return `${context.parsed.y.toFixed(0)}ms (${count} suggestions)`;
                  },
                },
              },
            },
            scales: {
              x: {
                ticks: { color: textColor },
                grid: { color: gridColor },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  color: textColor,
                  callback: function (value) {
                    return value;
                  },
                },
                grid: { color: gridColor },
                title: {
                  display: true,
                  text: "Time (milliseconds)",
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

export default ResponseTimeBarChart;
