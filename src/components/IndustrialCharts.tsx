import React, { useRef, useEffect } from 'react';

// Industrial Line Chart Component
interface IndustrialLineChartProps {
  data: number[];
  labels?: string[];
  color?: 'teal' | 'orange' | 'amber' | 'emerald';
  title?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
}

export function IndustrialLineChart({
  data,
  labels,
  color = 'teal',
  title,
  height = 200,
  showGrid = true,
  animated = true,
  className = ''
}: IndustrialLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const colorMap = {
    teal: '#14b8a6',
    orange: '#f97316',
    amber: '#f59e0b',
    emerald: '#10b981'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const chartHeight = canvas.height - 40; // Leave room for labels

    // Clear canvas
    ctx.clearRect(0, 0, width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i <= 5; i++) {
        const y = (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw data line
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;

    const points = data.map((val, i) => ({
      x: (width / (data.length - 1)) * i,
      y: chartHeight - ((val - minVal) / range) * chartHeight
    }));

    // Draw line
    ctx.strokeStyle = colorMap[color];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }

    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();

    // Draw glow effect
    ctx.strokeStyle = `${colorMap[color]}40`;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Draw points
    points.forEach(point => {
      ctx.fillStyle = colorMap[color];
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.fillStyle = `${colorMap[color]}40`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    if (labels) {
      ctx.fillStyle = '#64748b';
      ctx.font = '10px SF Mono, Fira Code, monospace';
      ctx.textAlign = 'center';

      labels.forEach((label, i) => {
        const x = (width / (labels.length - 1)) * i;
        ctx.fillText(label, x, canvas.height - 10);
      });
    }

    // Animated pulse effect on last point
    if (animated) {
      const lastPoint = points[points.length - 1];
      let pulseRadius = 3;
      let growing = true;

      const animate = () => {
        if (!canvasRef.current) return;

        // Redraw static chart
        ctx.clearRect(0, 0, width, canvas.height);
        // ... (repeat drawing code)

        // Draw pulse
        ctx.strokeStyle = `${colorMap[color]}80`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (growing) {
          pulseRadius += 0.2;
          if (pulseRadius > 8) growing = false;
        } else {
          pulseRadius -= 0.2;
          if (pulseRadius < 3) growing = true;
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, color, showGrid, animated]);

  return (
    <div className={`space-y-2 ${className}`}>
      {title && (
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-600">
          {title}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full border-2 border-slate-800 rounded bg-slate-950"
      />
    </div>
  );
}

// Industrial Bar Chart Component
interface IndustrialBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
  height?: number;
  horizontal?: boolean;
  showValues?: boolean;
  className?: string;
}

export function IndustrialBarChart({
  data,
  title,
  height = 200,
  horizontal = false,
  showValues = true,
  className = ''
}: IndustrialBarChartProps) {
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-600">
          {title}
        </div>
      )}
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = (item.value / maxVal) * 100;
          const barColor = item.color || 'bg-teal-500';

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-[10px] font-mono text-slate-500 truncate">
                {item.label}
              </div>
              <div className="flex-1 h-4 bg-slate-950 border border-slate-800 rounded overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {showValues && (
                <div className="w-16 text-[10px] font-mono text-white tabular-nums text-right">
                  {item.value.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Industrial Gauge Chart Component
interface IndustrialGaugeProps {
  value: number;
  min: number;
  max: number;
  label?: string;
  unit?: string;
  color?: 'teal' | 'orange' | 'amber' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IndustrialGauge({
  value,
  min,
  max,
  label,
  unit,
  color = 'teal',
  size = 'md',
  className = ''
}: IndustrialGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const sizeMap = {
    sm: { width: 120, height: 60 },
    md: { width: 160, height: 80 },
    lg: { width: 200, height: 100 }
  };

  const { width, height } = sizeMap[size];
  const colorMap = {
    teal: '#14b8a6',
    orange: '#f97316',
    amber: '#f59e0b',
    emerald: '#10b981'
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${width * 0.1} ${height * 0.8} A ${width * 0.4} ${width * 0.4} 0 0 1 ${width * 0.9} ${height * 0.8}`}
          fill="none"
          stroke="rgba(30, 41, 59, 0.5)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={`M ${width * 0.1} ${height * 0.8} A ${width * 0.4} ${width * 0.4} 0 0 1 ${width * 0.9} ${height * 0.8}`}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.5} 100`}
          className="transition-all duration-300"
        />

        {/* Center text */}
        <text
          x={width / 2}
          y={height * 0.7}
          textAnchor="middle"
          className="text-2xl font-mono font-bold fill-white tabular-nums"
        >
          {value.toFixed(1)}
        </text>

        {unit && (
          <text
            x={width / 2}
            y={height * 0.85}
            textAnchor="middle"
            className="text-xs font-mono fill-slate-500"
          >
            {unit}
          </text>
        )}
      </svg>

      {label && (
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600 text-center">
          {label}
        </div>
      )}
    </div>
  );
}

// Real-time Data Monitor Component
interface RealtimeMonitorProps {
  data: Array<{
    timestamp: Date;
    value: number;
  }>;
  color?: 'teal' | 'orange' | 'amber';
  maxPoints?: number;
  height?: number;
  className?: string;
}

export function RealtimeMonitor({
  data,
  color = 'teal',
  maxPoints = 20,
  height = 150,
  className = ''
}: RealtimeMonitorProps) {
  const recentData = data.slice(-maxPoints);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-600">
          Real-time Monitor
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
          <span className="text-[10px] font-mono text-slate-500">LIVE</span>
        </div>
      </div>

      <IndustrialLineChart
        data={recentData.map(d => d.value)}
        color={color}
        height={height}
        showGrid
        animated
      />
    </div>
  );
}