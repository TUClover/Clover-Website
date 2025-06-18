import { useEffect, useState } from "react";
import { AIStats } from "../api/types/suggestion";
import { ChartOptions } from "chart.js";
import DatePicker from "react-datepicker";
import { Line } from "react-chartjs-2";

/**
 * AIStatGraph component
 * Only available in the developer dashboard.
 * @param {aiStats[]} The AI statistics data to be displayed in the graph.
 * @returns {JSX.Element} - The AIStatGraph component.
 */
export const AIStatGraph = ({
  aiStats,
}: {
  aiStats: AIStats[] | undefined;
}) => {
  const [textColor, setTextColor] = useState("#000000");
  const [gridColor, setGridColor] = useState("rgba(0,0,0,0.1)");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const MAX_FLASH_2_0_REQUESTS_PER_DAY = 1500; // Max Requests Per Day for Gemini Flash 2.0

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

  const groupedStats = new Map<
    string,
    { totalTokens: number; requestCount: number }
  >();

  aiStats?.forEach((stat) => {
    const dateObj = new Date(stat.created_at);
    const dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!groupedStats.has(dateStr)) {
      groupedStats.set(dateStr, { totalTokens: 0, requestCount: 0 });
    }
    const currentStats = groupedStats.get(dateStr)!;
    currentStats.totalTokens += stat.total_tokens;
    currentStats.requestCount += 1;
  });

  let firstDate = startDate;
  let lastDate = endDate;

  if (!firstDate || !lastDate) {
    const dates = aiStats
      ?.map((s) => new Date(s.created_at))
      .sort((a, b) => a.getTime() - b.getTime());
    if (!firstDate && dates?.[0]) firstDate = dates[0];
    if (!lastDate && dates?.[dates.length - 1])
      lastDate = dates[dates.length - 1];
  }

  const allDates: string[] = [];
  if (firstDate && lastDate) {
    const curr = new Date(firstDate);
    curr.setHours(0, 0, 0, 0);
    const end = new Date(lastDate);
    end.setHours(0, 0, 0, 0);

    while (curr <= end) {
      allDates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }
  }

  const sortedDates = allDates;
  const tokensByDate = sortedDates.map(
    (date) => groupedStats.get(date)?.totalTokens ?? 0
  );
  const requestsByDate = sortedDates.map(
    (date) => groupedStats.get(date)?.requestCount ?? 0
  );

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Total Tokens Used",
        data: tokensByDate,
        borderColor: "#50B498",
        backgroundColor: "rgba(80, 180, 152, 0.2)",
        tension: 0.3,
        fill: true,
        yAxisID: "y",
      },
      {
        label: "Total Requests Made",
        data: requestsByDate,
        borderColor: "#4A90E2",
        backgroundColor: "rgba(74, 144, 226, 0.2)",
        tension: 0.3,
        fill: false,
        yAxisID: "y1",
      },
      {
        label: `Max Requests/Day (Tier 1)`,
        data: sortedDates.map(() => MAX_FLASH_2_0_REQUESTS_PER_DAY),
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: textColor },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: { color: gridColor },
      },
      y: {
        // Left Y-axis for tokens
        type: "linear",
        position: "left",
        ticks: { color: textColor },
        grid: { color: gridColor },
        title: {
          display: true,
          text: "Tokens Used",
          color: textColor,
        },
      },
      y1: {
        // Right Y-axis for requests
        type: "linear",
        position: "right",
        ticks: { color: textColor },
        grid: { color: "transparent" }, // No grid lines for this axis, or a very faint one
        title: {
          display: true,
          text: "Requests",
          color: textColor,
        },
        suggestedMax: MAX_FLASH_2_0_REQUESTS_PER_DAY * 1.2, // Add padding above the max limit
        min: 0, // Ensure requests start from 0
      },
    },
  };

  return (
    <div className="w-full h-auto bg-white dark:bg-black border border-gray-600 dark:border-gray-400 rounded-lg shadow p-4 pb-12">
      {/* Header with responsive flex layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-2">
        <h2 className="text-lg font-semibold">AI Stats</h2>

        {/* Date pickers with responsive layout */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 items-start xs:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap w-12">
              From:
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="dark:bg-black border text-sm w-full min-w-[120px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap w-12">
              To:
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="dark:bg-black border text-sm w-full min-w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Responsive chart container */}
      <div
        className="relative w-full"
        style={{ height: "clamp(200px, 30vh, 400px)" }}
      >
        <Line
          data={chartData}
          options={{
            ...chartOptions,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...chartOptions.plugins,
              legend: {
                ...chartOptions.plugins?.legend,
                position: "bottom",
              },
            },
          }}
        />
      </div>
    </div>
  );
};
