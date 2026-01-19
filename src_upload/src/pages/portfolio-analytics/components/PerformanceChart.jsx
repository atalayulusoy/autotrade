import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';


const PerformanceChart = ({ data, title, type = 'line' }) => {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState(type);

  const timeframes = [
    { label: '1G', value: '1D' },
    { label: '7G', value: '7D' },
    { label: '1A', value: '1M' },
    { label: '3A', value: '3M' },
    { label: '1Y', value: '1Y' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="caption text-muted-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="caption" style={{ color: entry?.color }}>
                {entry?.name}:
              </span>
              <span className="caption font-medium text-foreground data-text">
                {entry?.value?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">{title}</h3>
          <p className="caption text-muted-foreground">Portföy performans analizi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {timeframes?.map((tf) => (
              <button
                key={tf?.value}
                onClick={() => setTimeframe(tf?.value)}
                className={`px-3 py-1.5 rounded-md caption font-medium transition-all duration-250 ${
                  timeframe === tf?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf?.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-all duration-250 ${
                chartType === 'line' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Çizgi grafik"
            >
              <Icon name="LineChart" size={16} />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-2 rounded-md transition-all duration-250 ${
                chartType === 'area' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Alan grafik"
            >
              <Icon name="AreaChart" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-64 md:h-80 lg:h-96" aria-label={`${title} grafiği`}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000)?.toFixed(0)}K ₺`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-foreground)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={false}
                name="Portföy Değeri"
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="var(--color-muted-foreground)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Benchmark"
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000)?.toFixed(0)}K ₺`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-foreground)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                name="Portföy Değeri"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;