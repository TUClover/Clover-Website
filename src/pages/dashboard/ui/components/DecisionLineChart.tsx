import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { parseISODate } from "@/utils/timeConverter";
import { CustomTooltip } from "@/components/CustomTooltip";
import { Card } from "@/components/ui/card";
import { ACCEPT_EVENTS, REJECT_EVENTS } from "@/types/event";
import { ActivityLogResponse } from "@/types/suggestion";
import CustomSelect from "@/components/CustomSelect";

enum TimeInterval {
  DAY = "Day",
  WEEK = "Week",
  MONTH = "Month",
}

/**
 * LineChart component displays a line chart of user activity over time.
 * @param {string} title - The title of the chart.
 * @param {Array} activities - An array of user activity log items.
 * @returns {JSX.Element} - A line chart component.
 **/
export const DecisionLineChart = ({
  title = "Decision Over Time",
  activities,
}: {
  title?: string;
  activities: ActivityLogResponse;
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

  const acceptedMap: Record<string, number> = {};
  const rejectedMap: Record<string, number> = {};

  activities.forEach((activity) => {
    const date =
      typeof activity.createdAt === "string"
        ? new Date(activity.createdAt)
        : new Date(activity.createdAt);

    const key = groupBy(date, interval);

    const isAcceptEvent = ACCEPT_EVENTS.includes(activity.event);
    const isRejectEvent = REJECT_EVENTS.includes(activity.event);

    if (key) {
      if (isAcceptEvent) {
        acceptedMap[key] = (acceptedMap[key] || 0) + 1;
      } else if (isRejectEvent) {
        rejectedMap[key] = (rejectedMap[key] || 0) + 1;
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
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 7);
        range.push(groupBy(date, interval)!);
      }
    }

    if (interval === TimeInterval.MONTH) {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        range.push(groupBy(date, interval)!);
      }
    }

    return range;
  };

  const labels = getLabelRange();
  const acceptedValues = labels.map((key) => acceptedMap[key] || 0);
  const rejectedValues = labels.map((key) => rejectedMap[key] || 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <CustomTooltip
          trigger={
            <h2 className="text-lg font-semibold text-alpha">{title}</h2>
          }
        >
          <div className="space-y-2">
            <p className="text-sm">
              This line chart shows how many code suggestions users{" "}
              <span className="font-semibold text-alpha">accepted</span> or{" "}
              <span className="font-semibold text-beta">rejected</span> over
              time.
            </p>
            <p className="text-xs text-muted-foreground">
              Time range can be adjusted (daily/weekly/monthly)
            </p>
          </div>
        </CustomTooltip>

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
                label: "Accepted Suggestions",
                data: acceptedValues,
                borderColor: "#50B498",
                backgroundColor: "#50B498",
                borderWidth: 2,
                tension: 0.3,
                fill: false,
                pointBackgroundColor: "#50B498",
                pointBorderColor: "#FFFFFF",
                pointBorderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
              {
                label: "Rejected Suggestions",
                data: rejectedValues,
                borderColor: "#F59E0B",
                backgroundColor: "#F59E0B",
                borderWidth: 2,
                tension: 0.3,
                fill: false,
                pointBackgroundColor: "#F59E0B",
                pointBorderColor: "#FFFFFF",
                pointBorderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                labels: { color: textColor },
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
                      return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
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
                ticks: { color: textColor, precision: 0 },
                grid: { color: gridColor },
                title: {
                  display: true,
                  text: "Number of Decisions",
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

export default DecisionLineChart;
