import React from 'react';

// ============================================================================
// BAR CHART COMPONENT
// ============================================================================

export interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  className?: string;
  horizontal?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function BarChart({ 
  data, 
  height = 200,
  className = '',
  horizontal = false,
  showGrid = true,
  showTooltip = true
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const padding = 20;
  const chartWidth = 800;
  const chartHeight = height - padding * 2;
  const barWidth = horizontal ? 30 : (chartWidth / data.length) * 0.7;
  const gap = horizontal ? 10 : (chartWidth / data.length) * 0.3;

  if (horizontal) {
    const barHeight = (chartHeight / data.length) * 0.7;
    const barGap = (chartHeight / data.length) * 0.3;

    return (
      <div className={`w-full ${className}`}>
        <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
          {showGrid && (
            <g className="text-gray-200 dark:text-gray-700">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1={chartWidth * ratio + padding}
                  y1={padding}
                  x2={chartWidth * ratio + padding}
                  y2={height - padding}
                  stroke="currentColor"
                  strokeWidth={1}
                />
              ))}
            </g>
          )}
          
          {data.map((point, index) => {
            const barLength = (point.value / maxValue) * (chartWidth - padding * 2);
            const y = padding + index * (barHeight + barGap);
            const color = point.color || '#3b82f6';
            
            return (
              <g key={index}>
                <rect
                  x={padding}
                  y={y}
                  width={barLength}
                  height={barHeight}
                  fill={color}
                  rx={4}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {showTooltip && (
                    <title>
                      {point.label}: {point.value}
                    </title>
                  )}
                </rect>
                <text
                  x={padding + barLength + 5}
                  y={y + barHeight / 2 + 4}
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

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
        
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + gap);
          const y = chartHeight - barHeight + padding;
          const color = point.color || '#3b82f6';
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={4}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                {showTooltip && (
                  <title>
                    {point.label}: {point.value}
                  </title>
                )}
              </rect>
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
