import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const SpreadChart = ({ opportunities, selectedPair }) => {
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    generateChartData();
  }, [selectedPair, timeRange, opportunities]);

  const generateChartData = () => {
    const dataPoints = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : 72;
    const data = [];
    const now = new Date();
    
    for (let i = dataPoints; i >= 0; i--) {
      const time = new Date(now - i * (timeRange === '1h' ? 5 : timeRange === '6h' ? 10 : 20) * 60000);
      data?.push({
        time: time?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        spread: (Math.random() * 2 + 0.5)?.toFixed(2),
        avgSpread: (Math.random() * 1.5 + 0.8)?.toFixed(2),
        maxSpread: (Math.random() * 3 + 1.5)?.toFixed(2)
      });
    }
    setChartData(data);
  };

  const timeRanges = [
    { value: '1h', label: '1 Saat' },
    { value: '6h', label: '6 Saat' },
    { value: '24h', label: '24 Saat' }
  ];

  const currentSpread = opportunities?.find(o => o?.symbol === selectedPair)?.profit_percentage || 0;
  const avgSpread = chartData?.reduce((sum, d) => sum + parseFloat(d?.spread), 0) / (chartData?.length || 1);
  const maxSpread = Math.max(...chartData?.map(d => parseFloat(d?.maxSpread)));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Mevcut Spread</p>
          <p className="text-2xl font-bold text-primary mt-1">{currentSpread?.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{selectedPair}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Ortalama Spread</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">{avgSpread?.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Son {timeRange}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Maksimum Spread</p>
          <p className="text-2xl font-bold text-success mt-1">{maxSpread?.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground mt-1">En yüksek fırsat</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} />
            <h3 className="text-lg font-semibold text-foreground">Spread Geçmişi</h3>
          </div>
          <div className="flex gap-2">
            {timeRanges?.map(range => (
              <button
                key={range?.value}
                onClick={() => setTimeRange(range?.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range?.value
                    ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {range?.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={{ value: 'Spread (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="spread" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Anlık Spread"
              dot={{ fill: '#3b82f6', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="avgSpread" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Ortalama"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="maxSpread" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="3 3"
              name="Maksimum"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Trend Analizi</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Spread Trendi</span>
            <span className="text-sm font-medium text-success">Yükseliş</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volatilite</span>
            <span className="text-sm font-medium text-yellow-500">Orta</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Optimal İşlem Zamanı</span>
            <span className="text-sm font-medium text-primary">Şimdi</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tahmini Süre</span>
            <span className="text-sm font-medium text-foreground">15-30 dakika</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpreadChart;