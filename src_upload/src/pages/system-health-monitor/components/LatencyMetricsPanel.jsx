import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LatencyMetricsPanel = ({ refreshTrigger }) => {
  const [latencyData, setLatencyData] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState('all');

  const exchanges = ['OKX', 'Binance', 'Bybit', 'Gate.io', 'BTCTURK'];

  useEffect(() => {
    generateLatencyData();
  }, [refreshTrigger]);

  const generateLatencyData = () => {
    const now = Date.now();
    const newData = [];

    for (let i = 20; i >= 0; i--) {
      const timestamp = new Date(now - i * 5000);
      const dataPoint = {
        time: timestamp?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        OKX: 40 + Math.random() * 20,
        Binance: 30 + Math.random() * 15,
        Bybit: 50 + Math.random() * 25,
        'Gate.io': 100 + Math.random() * 40,
        BTCTURK: 25 + Math.random() * 15
      };
      newData?.push(dataPoint);
    }

    setLatencyData(newData);
  };

  const getAverageLatency = (exchange) => {
    if (latencyData?.length === 0) return 0;
    const sum = latencyData?.reduce((acc, curr) => acc + (curr?.[exchange] || 0), 0);
    return (sum / latencyData?.length)?.toFixed(1);
  };

  const getLatencyColor = (latency) => {
    if (latency < 50) return 'text-green-400';
    if (latency < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <Icon name="Zap" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gecikme Metrikleri</h2>
            <p className="text-slate-400 text-sm">Ping süreleri ve yanıt hızları</p>
          </div>
        </div>
        <select
          value={selectedExchange}
          onChange={(e) => setSelectedExchange(e?.target?.value)}
          className="bg-slate-700/50 rounded-lg px-3 py-2 text-slate-300 text-sm border border-slate-600/50 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tüm Borsalar</option>
          {exchanges?.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      {/* Average Latency Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {exchanges?.map(exchange => {
          const avgLatency = parseFloat(getAverageLatency(exchange));
          return (
            <div key={exchange} className="bg-slate-700/30 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">{exchange}</div>
              <div className={`text-xl font-bold ${getLatencyColor(avgLatency)}`}>
                {avgLatency}ms
              </div>
            </div>
          );
        })}
      </div>

      {/* Latency Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={latencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Gecikme (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {(selectedExchange === 'all' ? exchanges : [selectedExchange])?.map((exchange, index) => {
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
              return (
                <Line
                  key={exchange}
                  type="monotone"
                  dataKey={exchange}
                  stroke={colors?.[index % colors?.length]}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LatencyMetricsPanel;