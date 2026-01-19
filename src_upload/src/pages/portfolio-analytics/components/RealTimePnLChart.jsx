import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

ChartJS?.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const RealTimePnLChart = () => {
  const { user } = useAuth();
  const [pnlData, setPnlData] = useState([]);
  const [totalPnL, setTotalPnL] = useState(0);
  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(false);

  const loadPnLData = async () => {
    try {
      setLoading(true);
      const hoursMap = { '1D': 24, '7D': 168, '1M': 720, '3M': 2160 };
      const hours = hoursMap?.[timeframe] || 24;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      const { data, error } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'completed')
        ?.gte('sell_executed_at', startDate?.toISOString())
        ?.order('sell_executed_at', { ascending: true });

      if (error) throw error;

      // Calculate cumulative P&L
      let cumulative = 0;
      const chartData = (data || [])?.map((trade) => {
        cumulative += parseFloat(trade?.actual_profit || 0);
        return {
          time: new Date(trade?.sell_executed_at)?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          pnl: cumulative
        };
      });

      setPnlData(chartData);
      setTotalPnL(cumulative);
    } catch (error) {
      console.error('Error loading P&L data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPnLData();
      const interval = setInterval(loadPnLData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, timeframe]);

  const chartData = {
    labels: pnlData?.map(d => d?.time),
    datasets: [
      {
        label: 'Kar/Zarar',
        data: pnlData?.map(d => d?.pnl),
        borderColor: totalPnL >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: totalPnL >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `P&L: ${context?.parsed?.y?.toFixed(2)} USDT`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: 'rgb(148, 163, 184)',
          callback: (value) => `${value?.toFixed(0)} USDT`
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(148, 163, 184)',
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Gerçek Zamanlı P&L</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${
              totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL?.toFixed(2)} USDT
            </span>
            <Icon
              name={totalPnL >= 0 ? 'TrendingUp' : 'TrendingDown'}
              size={20}
              className={totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {['1D', '7D', '1M', '3M']?.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {loading && pnlData?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Yükleniyor...
          </div>
        ) : pnlData?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Bu zaman diliminde veri yok
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default RealTimePnLChart;