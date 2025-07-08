import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { parseISODate } from "../utils/timeConverter";
import InfoTooltip from "./InfoTooltip";
import { Card } from "./ui/card";
import { LogEvent } from "../api/types/event";
import { UserActivityLogItem } from "../api/types/suggestion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { InstructorLogResponse } from "../api/classes";

enum TimeInterval {
  DAY = "Day",
  WEEK = "Week",
  MONTH = "Month",
}

/**
 * StackedBarChart component displays a stacked bar chart of user activity log items.
 * It shows the number of correct and incorrect suggestions over time, grouped by day, week, or month.
 * @param props - The props for the StackedBarChart component.
 * @param {string?} props.title - The title of the chart.
 * @param {UserActivityLogItem[]} props.activities - The user activity log items to be displayed in the chart.
 * @returns
 */
export const StackedBarChart = ({
  title = "Correct vs Incorrect Over Time",
  activities,
}: {
  title?: string;
  activities: UserActivityLogItem[] | InstructorLogResponse[];
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

  const groupBy = (date: Date, interval: TimeInterval): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    switch (interval) {
      case TimeInterval.DAY:
        return date.toISOString().split("T")[0];

      case TimeInterval.WEEK: {
        const weekStart = new Date(date);
        weekStart.setDate(day - date.getDay()); // Sunday
        return weekStart.toISOString().split("T")[0];
      }

      case TimeInterval.MONTH:
        return `${year}-${String(month + 1).padStart(2, "0")}`;

      default:
        return "";
    }
  };

  const dateMap: Record<string, { correct: number; incorrect: number }> = {};

  activities.forEach((activity) => {
    // Handle both string and Date for createdAt
    const date =
      typeof activity.createdAt === "string"
        ? new Date(activity.createdAt)
        : new Date(activity.createdAt);

    const key = groupBy(date, interval);

    if (!dateMap[key]) {
      dateMap[key] = { correct: 0, incorrect: 0 };
    }

    // Enhanced event detection for both accept and reject events
    const isAcceptEvent =
      activity.event === LogEvent.SUGGESTION_ACCEPT ||
      activity.event === "SUGGESTION_ACCEPT" ||
      activity.event.includes("ACCEPT");

    const isRejectEvent =
      activity.event === LogEvent.USER_REJECT ||
      activity.event === "USER_REJECT" ||
      activity.event.includes("REJECT");

    // Only count decisions (accept or reject events)
    if (isAcceptEvent || isRejectEvent) {
      // Logic for determining if the decision was correct
      // Correct decisions: Accept good code (no bug) OR Reject bad code (has bug)
      // Incorrect decisions: Accept bad code (has bug) OR Reject good code (no bug)

      const isCorrectDecision =
        (isAcceptEvent && !activity.hasBug) ||
        (isRejectEvent && activity.hasBug);

      if (isCorrectDecision) {
        dateMap[key].correct += 1;
      } else {
        dateMap[key].incorrect += 1;
      }
    }
  });

  const getLabelRange = (): string[] => {
    const range: string[] = [];
    const today = new Date();

    switch (interval) {
      case TimeInterval.DAY:
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          range.push(groupBy(date, interval));
        }
        break;

      case TimeInterval.WEEK: {
        const lastSunday = new Date(today);
        lastSunday.setDate(today.getDate() - today.getDay());

        for (let i = 6; i >= 0; i--) {
          const date = new Date(lastSunday);
          date.setDate(lastSunday.getDate() - i * 7);
          range.push(groupBy(date, interval));
        }
        break;
      }

      case TimeInterval.MONTH:
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          range.push(groupBy(date, interval));
        }
        break;
    }

    return range;
  };

  const labels = getLabelRange();
  const correctData = labels.map((key) => dateMap[key]?.correct || 0);
  const incorrectData = labels.map((key) => dateMap[key]?.incorrect || 0);

  const data = {
    labels,
    datasets: [
      {
        label: "Correct",
        data: correctData,
        backgroundColor: "#50B498",
      },
      {
        label: "Incorrect",
        data: incorrectData,
        backgroundColor: "#F59E0B",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: "Correct vs Incorrect Suggestions",
        color: textColor,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
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
        grid: {
          color: gridColor,
        },
      },
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          color: textColor,
          precision: 0,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[#50B498]">{title}</h2>
          <InfoTooltip>
            <div className="space-y-2">
              <p className="text-sm">
                This stacked bar chart visualizes the accuracy of user decisions
                over time. It shows the number of{" "}
                <span className="font-semibold text-[#50B498]">correct</span>{" "}
                and{" "}
                <span className="font-semibold text-[#F59E0B]">incorrect</span>{" "}
                decisions made each day/week/month.
              </p>
              <p className="text-xs text-muted-foreground">
                Correct: Accepting good suggestions or rejecting bad ones
                <br />
                Incorrect: Accepting bad suggestions or rejecting good ones
              </p>
            </div>
          </InfoTooltip>
        </div>

        <Select
          value={interval}
          onValueChange={(value) => setInterval(value as TimeInterval)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TimeInterval.DAY}>Day</SelectItem>
            <SelectItem value={TimeInterval.WEEK}>Week</SelectItem>
            <SelectItem value={TimeInterval.MONTH}>Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full h-60 md:h-64 lg:h-72">
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
};

export default StackedBarChart;
