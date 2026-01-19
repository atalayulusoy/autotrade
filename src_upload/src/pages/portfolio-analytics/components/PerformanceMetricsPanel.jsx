import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const PerformanceMetricsPanel = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user, period]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const days = daysMap?.[period] || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Call the database function to calculate metrics
      const { data, error } = await supabase
        ?.rpc('calculate_performance_metrics', {
          p_user_id: user?.id,
          p_start_date: startDate?.toISOString(),
          p_end_date: endDate?.toISOString()
        });

      if (error) throw error;

      if (data && data?.length > 0) {
        setMetrics(data?.[0]);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: 'Toplam İşlem',
      value: metrics?.total_trades || 0,
      icon: 'Activity',
      color: 'blue'
    },
    {
      title: 'Kazanç Oranı',
      value: `${metrics?.win_rate?.toFixed(1) || 0}%`,
      icon: 'Target',
      color: 'green',
      subtitle: `${metrics?.winning_trades || 0} kazançlı / ${metrics?.losing_trades || 0} zarar`
    },
    {
      title: 'Sharpe Oranı',
      value: metrics?.sharpe_ratio?.toFixed(2) || '0.00',
      icon: 'TrendingUp',
      color: 'purple',
      subtitle: metrics?.sharpe_ratio >= 1.5 ? 'İyi performans' : 'Orta performans'
    },
    {
      title: 'Max Drawdown',
      value: `${(metrics?.max_drawdown * 100)?.toFixed(1) || 0}%`,
      icon: 'TrendingDown',
      color: 'red',
      subtitle: 'En yüksek kayıp'
    },
    {
      title: 'Toplam Kar',
      value: `${metrics?.total_profit?.toFixed(2) || 0} USDT`,
      icon: 'DollarSign',
      color: 'green'
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-400',
      green: 'bg-green-500/10 text-green-400',
      purple: 'bg-purple-500/10 text-purple-400',
      red: 'bg-red-500/10 text-red-400'
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Performans Metrikleri</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y']?.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p === '1y' ? '1 Yıl' : p?.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards?.map((metric, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">{metric?.title}</p>
                  <h3 className="text-2xl font-bold text-white">{metric?.value}</h3>
                  {metric?.subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{metric?.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${getColorClass(metric?.color)}`}>
                  <Icon name={metric?.icon} size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceMetricsPanel;