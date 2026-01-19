import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Icon from '../../../components/AppIcon';

const AssetAllocationChart = ({ data, title }) => {
  const COLORS = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-accent)',
    'var(--color-success)',
    'var(--color-warning)',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="caption font-medium text-foreground mb-1">{data?.name}</p>
          <p className="caption text-muted-foreground">
            Değer: {data?.value?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </p>
          <p className="caption text-muted-foreground">
            Oran: {data?.payload?.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry?.color }}
            />
            <span className="caption text-foreground truncate">{entry?.value}</span>
            <span className="caption text-muted-foreground ml-auto whitespace-nowrap">
              {entry?.payload?.percentage}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">{title}</h3>
          <p className="caption text-muted-foreground">Varlık dağılımı analizi</p>
        </div>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-card transition-colors"
          aria-label="Dışa aktar"
        >
          <Icon name="Download" size={18} />
        </button>
      </div>
      <div className="w-full h-64 md:h-80" aria-label={`${title} grafiği`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              label={({ percentage }) => `${percentage}%`}
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetAllocationChart;