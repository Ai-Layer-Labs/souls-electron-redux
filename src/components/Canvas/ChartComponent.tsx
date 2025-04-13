import React from 'react';
import { CanvasContentData } from 'stores/useCanvasStore';

interface ChartComponentProps {
  data: CanvasContentData;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  // For now, display a placeholder with chart data
  // In a real implementation, you would integrate with a chart library like Chart.js

  const chartType = data.chartType || 'bar';
  const chartData = data.chartData || {
    labels: [],
    datasets: []
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl shadow-md bg-white rounded p-4">
        <div className="font-semibold text-center mb-4">
          {chartType.toUpperCase()} Chart
        </div>

        <div className="text-center text-gray-500 p-8 border border-dashed border-gray-300 rounded">
          Chart visualization would appear here
          <br />
          <span className="text-xs">
            (Chart.js or similar library integration needed)
          </span>
        </div>

        {chartData.labels && chartData.labels.length > 0 && (
          <div className="mt-4">
            <div className="font-medium">Data:</div>
            <div className="text-xs overflow-auto max-h-32">
              <pre>{JSON.stringify(chartData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartComponent;