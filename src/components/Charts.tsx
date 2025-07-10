import { useState, useEffect, useMemo } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { parseISODate } from "../utils/timeConverter";
import InfoTooltip from "./InfoTooltip";
import { Card } from "./ui/card";
import { SuggestionData, UserActivityLogItem } from "../api/types/suggestion";
import CustomSelect from "./CustomSelect";

enum TimeInterval {
  DAY = "Day",
  WEEK = "Week",
  MONTH = "Month",
}

/**
 * AccuracyOverTime component displays a line chart of accuracy over time.
 * @param {string} title - The title of the chart.
 * @param {Array} userActivity - An array of user activity log items.
 **/
const AccuracyOverTime = ({
  title = "Accuracy Over Time",
  userActivity,
}: {
  title?: string;
  userActivity: UserActivityLogItem[];
}) => {
  const [interval, setInterval] = useState<TimeInterval>(TimeInterval.DAY);
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

  const groupBy = (date: Date, interval: TimeInterval) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    if (interval === TimeInterval.DAY) return date.toISOString().split("T")[0];

    if (interval === TimeInterval.WEEK) {
      const firstDay = new Date(date);
      firstDay.setDate(date.getDate() - date.getDay());

      const y = firstDay.getFullYear();
      const m = String(firstDay.getMonth() + 1).padStart(2, "0");
      const d = String(firstDay.getDate()).padStart(2, "0");

      return `${y}-${m}-${d}`;
    }

    if (interval === TimeInterval.MONTH)
      return `${year}-${String(month + 1).padStart(2, "0")}`;

    return "";
  };

  // Group activities by time period and calculate accuracy
  const accuracyMap: Record<string, { total: number; correct: number }> = {};

  userActivity.forEach((activity) => {
    const date = new Date(activity.createdAt);
    const key = groupBy(date, interval);

    if (key) {
      if (!accuracyMap[key]) {
        accuracyMap[key] = { total: 0, correct: 0 };
      }

      accuracyMap[key].total++;
      if (activity.hasBug === false) {
        accuracyMap[key].correct++;
      }
    }
  });

  const getLabelRange = () => {
    const range: string[] = [];
    const today = new Date();

    if (interval === TimeInterval.DAY) {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        range.push(groupBy(date, interval)!);
      }
    }

    if (interval === TimeInterval.WEEK) {
      for (let i = 5; i >= -1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 7);
        range.push(groupBy(date, interval)!);
      }
    }

    if (interval === TimeInterval.MONTH) {
      for (let i = 5; i >= -1; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        range.push(groupBy(date, interval)!);
      }
    }

    return range;
  };

  const labels = getLabelRange();

  // Calculate accuracy percentages for each time period
  const accuracyValues = labels.map((key) => {
    const stats = accuracyMap[key];
    if (!stats || stats.total === 0) return null; // No data for this period
    return (stats.correct / stats.total) * 100;
  });

  // Calculate total suggestions for each time period (for tooltip)
  const totalValues = labels.map((key) => accuracyMap[key]?.total || 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-alpha">{title}</h2>
          <InfoTooltip>
            <div className="space-y-2">
              <p className="text-sm">
                This chart shows your accuracy percentage over time.{" "}
                <span className="font-semibold text-alpha">Accuracy</span> is
                calculated as the percentage of suggestions that were correct
                (no bugs detected).
              </p>
              <p className="text-xs text-muted-foreground">
                Time range can be adjusted (daily/weekly/monthly). Periods with
                no activity are not shown on the chart.
              </p>
            </div>
          </InfoTooltip>
        </div>

        <CustomSelect
          value={interval}
          onValueChange={(value) => setInterval(value as TimeInterval)}
          options={[
            { value: TimeInterval.DAY, label: "Day" },
            { value: TimeInterval.WEEK, label: "Week" },
            { value: TimeInterval.MONTH, label: "Month" },
          ]}
          className="w-24"
        />
      </div>

      <div className="relative w-full h-60 md:h-64 lg:h-72">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Accuracy (%)",
                data: accuracyValues,
                borderColor: "#50B498",
                backgroundColor: "#50B498",
                borderWidth: 3,
                tension: 0.3,
                fill: false,
                pointBackgroundColor: "#50B498",
                pointBorderColor: "#FFFFFF",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                spanGaps: true, // Connect line across null values
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                labels: { color: textColor },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const accuracy = context.parsed.y;
                    const total = totalValues[context.dataIndex];

                    if (accuracy === null) return "No data";

                    return `Accuracy: ${accuracy.toFixed(1)}% (${total} suggestions)`;
                  },
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: {
                  color: textColor,
                  callback: function (value: unknown) {
                    const label = labels[value as number];
                    const date = parseISODate(label + "T00:00:00");

                    if (interval === TimeInterval.MONTH)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      });
                    if (interval === TimeInterval.WEEK)
                      return `Week of ${date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}`;
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  },
                },
                grid: { color: gridColor },
              },
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  color: textColor,
                  callback: function (value) {
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
            elements: {
              point: {
                hoverBackgroundColor: "#50B498",
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

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
          <h2 className="text-lg font-semibold text-alpha">{title}</h2>
          <InfoTooltip>
            <div className="space-y-2">
              <p className="text-sm">
                This chart shows your performance across different programming
                languages.
              </p>
            </div>
          </InfoTooltip>
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
        <h2 className="text-lg font-semibold text-alpha">{title}</h2>
        <InfoTooltip>
          <div className="space-y-2">
            <p className="text-sm">
              This donut chart shows your usage and accuracy across different{" "}
              <span className="font-semibold text-alpha">
                programming languages
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground">
              The size of each slice represents usage volume, and accuracy
              percentages are shown in the legend.
            </p>
          </div>
        </InfoTooltip>
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

// 2. Learning Progress Chart
interface LearningProgressProps {
  userActivity: UserActivityLogItem[];
  windowSize?: number;
  title?: string;
}

const LearningProgress: React.FC<LearningProgressProps> = ({
  userActivity,
  windowSize = 20,
  title = "Learning Progress",
}) => {
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
          <h2 className="text-lg font-semibold text-alpha">{title}</h2>
          <InfoTooltip>
            <div className="space-y-2">
              <p className="text-sm">
                This chart shows your learning progress over time.
              </p>
            </div>
          </InfoTooltip>
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
        <h2 className="text-lg font-semibold text-alpha">{title}</h2>
        <InfoTooltip>
          <div className="space-y-2">
            <p className="text-sm">
              This chart shows your{" "}
              <span className="font-semibold text-alpha">
                learning progress
              </span>{" "}
              using a rolling {windowSize}-suggestion average accuracy.
            </p>
            <p className="text-xs text-muted-foreground">
              An upward trend indicates improving ability to identify correct
              suggestions.
            </p>
          </div>
        </InfoTooltip>
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
                max: 100,
                ticks: {
                  color: textColor,
                  callback: function (value) {
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

// 3. Response Time Analysis Chart
interface ResponseTimeAnalysisProps {
  userActivity: UserActivityLogItem[];
  title?: string;
}

const ResponseTimeAnalysis: React.FC<ResponseTimeAnalysisProps> = ({
  userActivity,
  title = "Average Response Time",
}) => {
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

    const correctSuggestions = userActivity.filter(
      (log) => log.hasBug === false
    );
    const incorrectSuggestions = userActivity.filter(
      (log) => log.hasBug === true
    );
    const acceptedSuggestions = userActivity.filter((log) =>
      log.event.includes("ACCEPT")
    );
    const rejectedSuggestions = userActivity.filter((log) =>
      log.event.includes("REJECT")
    );

    const avgDuration = (logs: UserActivityLogItem[]) =>
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
          <h2 className="text-lg font-semibold text-alpha">{title}</h2>
          <InfoTooltip>
            <div className="space-y-2">
              <p className="text-sm">
                This chart shows average response times for different
                categories.
              </p>
            </div>
          </InfoTooltip>
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
        <h2 className="text-lg font-semibold text-alpha">{title}</h2>
        <InfoTooltip>
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
        </InfoTooltip>
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

export {
  AccuracyOverTime,
  LanguagePerformance,
  LearningProgress,
  ResponseTimeAnalysis,
};
