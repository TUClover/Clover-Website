import { Pie } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProgressData } from "@/types/user";
import CustomSelect from "@/components/CustomSelect";
import { CustomTooltip } from "@/components/CustomTooltip";

type DataMode = "total" | "accepted" | "rejected";

interface StatCardData {
  total: number;
  correct: number;
  accuracy: number;
  title: string;
}

interface AccuracyPieChartProps {
  title?: string;
  progressData?: ProgressData;
  onDataChange?: (data: { mode: DataMode; statData: StatCardData }) => void;
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
  onDataChange,
}: AccuracyPieChartProps) => {
  const [textColor, setTextColor] = useState("#000000");
  const [dataMode, setDataMode] = useState<DataMode>("total");

  const getData = () => {
    if (!progressData) {
      return {
        correct: 0,
        incorrect: 0,
        total: 0,
        title: "Total",
        accuracy: 0,
      };
    }

    switch (dataMode) {
      case "accepted": {
        // For accepted: only count correct accepts (suggestions that were accepted and were actually good)
        const correct = progressData.correctAccepts || 0; // You'll need to add this to ProgressData
        const total = progressData.totalAccepted;
        const incorrect = total - correct;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        return { correct, incorrect, total, title: "Accepted", accuracy };
      }
      case "rejected": {
        // For rejected: only count correct rejects (suggestions that were rejected and were actually bad)
        const correct = progressData.correctRejects || 0; // You'll need to add this to ProgressData
        const total = progressData.totalRejected;
        const incorrect = total - correct;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        return { correct, incorrect, total, title: "Rejected", accuracy };
      }
      case "total":
      default: {
        const correct = progressData.correctSuggestions;
        const total = progressData.totalInteractions;
        const incorrect = total - correct;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        return { correct, incorrect, total, title: "Total", accuracy };
      }
    }
  };

  const data = getData();
  const chartData = {
    correct: data.correct,
    incorrect: data.incorrect,
    total: data.total,
  };
  const statData = {
    total: data.total,
    correct: data.correct,
    accuracy: data.accuracy,
    title: data.title,
  };

  useEffect(() => {
    if (onDataChange) {
      onDataChange({ mode: dataMode, statData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMode, progressData, onDataChange]);

  const handleModeChange = (newMode: DataMode) => {
    setDataMode(newMode);
  };

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

  const pieData = {
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
            onValueChange={handleModeChange}
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
              on the selected view. This selection also updates the stat cards
              above.
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
          onValueChange={handleModeChange}
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
        <Pie data={pieData} options={options} />
      </div>
    </Card>
  );
};

export default AccuracyPieChart;
