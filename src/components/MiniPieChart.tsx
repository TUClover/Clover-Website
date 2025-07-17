import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { CustomTooltip } from "./CustomTooltip";
import { ProgressData } from "@/types/user";

interface MiniPieChartProps {
  progressData?: ProgressData;
  size?: "sm" | "md" | "lg";
}

export const MiniPieChart = ({
  progressData = {
    totalAccepted: 0,
    totalRejected: 0,
    totalInteractions: 0,
    correctSuggestions: 0,
    accuracyPercentage: 0,
  },
  size = "md",
}: MiniPieChartProps) => {
  const [textColor, setTextColor] = useState("#000000");

  const chartData = {
    correct: progressData.correctSuggestions,
    incorrect: progressData.totalInteractions - progressData.correctSuggestions,
    total: progressData.totalInteractions,
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return { container: "w-12 h-12", fontSize: "text-xs" };
      case "md":
        return { container: "w-16 h-16", fontSize: "text-sm" };
      case "lg":
        return { container: "w-20 h-20", fontSize: "text-base" };
      default:
        return { container: "w-12 h-12", fontSize: "text-xs" };
    }
  };

  const sizeClasses = getSizeClasses();

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
        data:
          chartData.total === 0
            ? [1]
            : [
                progressData.accuracyPercentage,
                100 - progressData.accuracyPercentage,
              ],
        backgroundColor:
          chartData.total === 0 ? ["#9CA3AF"] : ["#50B498", "#F59E0B"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    cutout: "85%",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div
      className={`relative ${sizeClasses.container} flex items-center justify-center`}
    >
      <Pie data={data} options={options} />
      <CustomTooltip
        trigger={
          <div
            className={`absolute inset-0 flex items-center justify-center ${sizeClasses.fontSize} font-bold`}
            style={{ color: textColor }}
          >
            <span>{progressData.accuracyPercentage.toFixed(0)}%</span>
          </div>
        }
        side="top"
        align="center"
      >
        <div className="space-y-2">
          <p className="text-sm">
            This pie chart illustrates the overall user accuracy.
          </p>
          {chartData.total === 0 ? (
            <p className="text-sm text-muted-foreground">
              No data available yet.
            </p>
          ) : (
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
          )}
        </div>
      </CustomTooltip>
    </div>
  );
};

export default MiniPieChart;
