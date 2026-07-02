import React from 'react';

// ============================================================================
// LINE CHART COMPONENT
// ============================================================================

export interface DataPoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function LineChart({ 
  data, 
  color = '#3b82f6',
  height = 200,
  className = '',
  showGrid = true,
  showTooltip = true
}: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const padding = 20;
  const chartWidth = 800;
  const chartHeight = height - padding * 2;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - (point.value / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

  return (
    <div className={`w-full ${className}`}>
      <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
        {showGrid && (
          <g className="text-gray-200 dark:text-gray-700">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={0}
                y1={chartHeight * (1 - ratio) + padding}
                x2={chartWidth}
                y2={chartHeight * (1 - ratio) + padding}
                stroke="currentColor"
                strokeWidth={1}
              />
            ))}
          </g>
        )}
        
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        
        <polygon
          points={areaPoints}
          fill={`url(#gradient-${color})`}
          transform={`translate(0, ${padding})`}
        />
        
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          transform={`translate(0, ${padding})`}
        />
        
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * chartWidth;
          const y = chartHeight - (point.value / maxValue) * chartHeight + padding;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={4}
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            >
              {showTooltip && (
                <title>
                  {point.label}: {point.value}
                </title>
              )}
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
