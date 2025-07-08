import { Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import InfoTooltip from "./InfoTooltip";
import { Card } from "./ui/card";
import { ProgressData } from "../api/types/suggestion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { InstructorLogResponse } from "../api/classes";
import { ActiveUserMode } from "../api/types/user";
import { getEventsForMode } from "../api/types/event";

type DataMode = "total" | "accepted" | "rejected";

interface PieChartProps {
  title?: string;
  progressData?: ProgressData;
  activities?: InstructorLogResponse[];
  dataMode: DataMode;
  onDataModeChange: (mode: DataMode) => void;
  mode?: ActiveUserMode;
}

/**
 * PieChart component displays a pie chart with correct and incorrect answers.
 * It uses the Chart.js library to render the chart and is responsive to dark mode changes.
 * @param props - The props for the PieChart component.
 * @param {string} props.title - The title of the chart.
 * @param {ProgressData} props.progressData - The progress data for the chart.
 * @returns {JSX.Element} - The rendered PieChart component.
 */
export const PieChart = ({
  title = "Correct vs Incorrect",
  progressData,
  activities,
  dataMode,
  onDataModeChange,
  mode,
}: PieChartProps) => {
  const [textColor, setTextColor] = useState("#000000");

  const getChartData = () => {
    // If progressData is provided, use it (existing logic)
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

    // If activities are provided, calculate from raw data
    if (activities && mode) {
      const events = getEventsForMode(mode);
      const acceptedLogs = activities.filter(
        (log) => log.event === events?.accept
      );
      const rejectedLogs = activities.filter(
        (log) => log.event === events?.reject
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

    // Fallback
    return { correct: 0, incorrect: 0, total: 0 };
  };

  const chartData = getChartData();
  const correctPercentage =
    chartData.total > 0 ? (chartData.correct / chartData.total) * 100 : 0;

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

  // Don't render if no data
  if (chartData.total === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-main">{title}</h2>
          </div>
          <Select value={dataMode} onValueChange={onDataModeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center h-60 md:h-64 lg:h-72">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-main">{title}</h2>
          <InfoTooltip>
            <div className="space-y-2">
              <p className="text-sm">
                This pie chart illustrates the accuracy of code suggestions
                based on the selected view.
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-alpha">Correct</span>:{" "}
                {chartData.correct} decisions ({correctPercentage.toFixed(1)}%)
                <br />
                <span className="font-medium text-beta">Incorrect</span>:{" "}
                {chartData.incorrect} decisions (
                {(100 - correctPercentage).toFixed(1)}%)
              </p>
            </div>
          </InfoTooltip>
        </div>

        <Select value={dataMode} onValueChange={onDataModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Total</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative w-full h-60 md:h-64 lg:h-72">
        <Pie data={data} options={options} />
      </div>
    </Card>
  );
};

export default PieChart;
