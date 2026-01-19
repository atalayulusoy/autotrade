import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const PLChart = ({ data, viewMode }) => {
  const [chartType, setChartType] = useState('cumulative'); // cumulative, periodic

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry?.color }}>
                {entry?.name}:
              </span>
              <span className="text-sm font-medium text-white">
                {entry?.value?.toFixed(2)} USDT
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {viewMode === 'monthly' ? 'Aylık' : 'Yıllık'} Kar/Zarar Analizi
          </h3>
          <p className="text-sm text-slate-400">
            {chartType === 'cumulative' ? 'Kümülatif getiri' : 'Periyodik performans'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('cumulative')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'cumulative' ?'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon name="TrendingUp" size={14} className="inline mr-1" />
            Kümülatif
          </button>
          <button
            onClick={() => setChartType('periodic')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'periodic' ?'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Icon name="BarChart3" size={14} className="inline mr-1" />
            Periyodik
          </button>
        </div>
      </div>

      <div className="w-full h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'cumulative' ? (
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value?.toFixed(0)} USDT`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                name="Kümülatif Kar"
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value?.toFixed(0)} USDT`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="trade"
                fill="#3b82f6"
                name="İşlem Karı"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PLChart;