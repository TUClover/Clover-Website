import { Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProgressData, UserMode } from "@/types/user";
import { ACCEPT_EVENTS, REJECT_EVENTS } from "@/types/event";
import CustomSelect from "@/components/CustomSelect";
import { CustomTooltip } from "@/components/CustomTooltip";
import { ActivityLogResponse } from "@/types/suggestion";

type DataMode = "total" | "accepted" | "rejected";

interface AccuracyPieChartProps {
  title?: string;
  progressData?: ProgressData;
  activities?: ActivityLogResponse;
  dataMode: DataMode;
  onDataModeChange: (mode: DataMode) => void;
  mode?: UserMode;
}

/**
 * PieChart component displays a pie chart with correct and incorrect answers.
 * It uses the Chart.js library to render the chart and is responsive to dark mode changes.
 * @param props - The props for the PieChart component.
 * @param {string} props.title - The title of the chart.
 * @param {ProgressData} props.progressData - The progress data for the chart.
 */
export const AccuracyPieChart = ({
  title = "Correct vs Incorrect",
  progressData,
  activities,
  dataMode,
  onDataModeChange,
  mode,
}: AccuracyPieChartProps) => {
  const [textColor, setTextColor] = useState("#000000");

  const getChartData = () => {
    if (progressData) {
      switch (dataMode) {
        case "accepted":
          return {
            correct: progressData.correctSuggestions,
            incorrect:
              progressData.totalAccepted - progressData.correctSuggestions,
            total: progressData.totalAccepted,
          };
        case "rejected":
          return {
            correct: 0,
            incorrect: progressData.totalRejected,
            total: progressData.totalRejected,
          };
        case "total":
        default:
          return {
            correct: progressData.correctSuggestions,
            incorrect:
              progressData.totalInteractions - progressData.correctSuggestions,
            total: progressData.totalInteractions,
          };
      }
    }

    if (activities && mode) {
      const acceptedLogs = activities.filter((log) =>
        ACCEPT_EVENTS.includes(log.event)
      );
      const rejectedLogs = activities.filter((log) =>
        REJECT_EVENTS.includes(log.event)
      );

      const totalAccepted = acceptedLogs.length;
      const totalRejected = rejectedLogs.length;
      const totalInteractions = totalAccepted + totalRejected;
      const correctSuggestions = acceptedLogs.filter(
        (log) => !log.hasBug
      ).length;

      switch (dataMode) {
        case "accepted":
          return {
            correct: correctSuggestions,
            incorrect: totalAccepted - correctSuggestions,
            total: totalAccepted,
          };
        case "rejected":
          return {
            correct: 0,
            incorrect: totalRejected,
            total: totalRejected,
          };
        case "total":
        default:
          return {
            correct: correctSuggestions,
            incorrect: totalInteractions - correctSuggestions,
            total: totalInteractions,
          };
      }
    }

    return { correct: 0, incorrect: 0, total: 0 };
  };

  const chartData = getChartData();

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

  const data = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [chartData.correct, chartData.incorrect],
        backgroundColor: ["#50B498", "#F59E0B"],
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
  };

  if (chartData.total === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-main">{title}</h2>
          </div>

          <CustomSelect
            value={dataMode}
            onValueChange={onDataModeChange}
            options={[
              { value: "total", label: "Total" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
            ]}
            placeholder="Select Mode"
          />
        </div>
        <div className="flex items-center justify-center h-60 md:h-64 lg:h-72">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <CustomTooltip
          trigger={
            <h2 className="text-lg font-semibold text-main text-primary">
              {title}
            </h2>
          }
          side="top"
          align="center"
        >
          <div className="space-y-2">
            <p className="text-sm">
              This pie chart illustrates the accuracy of code suggestions based
              on the selected view.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-alpha">Correct</span>:{" "}
              {chartData.correct} decisions (
              {((chartData.correct / chartData.total) * 100).toFixed(1)}%)
              <br />
              <span className="font-medium text-beta">Incorrect</span>:{" "}
              {chartData.incorrect} decisions (
              {(100 - (chartData.correct / chartData.total) * 100).toFixed(1)}
              %)
            </p>
          </div>
        </CustomTooltip>

        <CustomSelect
          value={dataMode}
          onValueChange={onDataModeChange}
          options={[
            { value: "total", label: "Total" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ]}
          placeholder="Select Mode"
          className="w-32"
        />
      </div>

      <div className="relative w-full h-60 md:h-64 lg:h-72">
        <Pie data={data} options={options} />
      </div>
    </Card>
  );
};

export default AccuracyPieChart;
