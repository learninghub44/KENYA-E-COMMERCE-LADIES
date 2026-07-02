import React from 'react';

// ============================================================================
// PIE CHART COMPONENT
// ============================================================================

export interface PieDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieDataPoint[];
  size?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
}

export function PieChart({ 
  data, 
  size = 200,
  className = '',
  showLegend = true,
  showTooltip = true
}: PieChartProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const radius = size / 2;
  const center = size / 2;
  
  let currentAngle = 0;
  
  const slices = data.map((point) => {
    const percentage = point.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle += angle;
    
    return {
      path: pathData,
      color: point.color,
      label: point.label,
      value: point.value,
      percentage: (percentage * 100).toFixed(1),
    };
  });

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.path}
            fill={slice.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            {showTooltip && (
              <title>
                {slice.label}: {slice.value} ({slice.percentage}%)
              </title>
            )}
          </path>
        ))}
      </svg>
      
      {showLegend && (
        <div className="flex flex-col gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: point.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
