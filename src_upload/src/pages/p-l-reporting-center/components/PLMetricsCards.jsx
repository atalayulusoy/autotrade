import React from 'react';
import Icon from '../../../components/AppIcon';

const PLMetricsCards = ({ data }) => {
  const metrics = [
    {
      title: 'Toplam Kar/Zarar',
      value: `${data?.totalProfit?.toFixed(2) || '0.00'} USDT`,
      icon: 'DollarSign',
      color: data?.totalProfit >= 0 ? 'green' : 'red',
      change: data?.totalProfit >= 0 ? '+' : ''
    },
    {
      title: 'Gerçekleşen Kazanç',
      value: `${data?.realizedGains?.toFixed(2) || '0.00'} USDT`,
      icon: 'TrendingUp',
      color: 'blue'
    },
    {
      title: 'Toplam Komisyon',
      value: `${data?.totalFees?.toFixed(2) || '0.00'} USDT`,
      icon: 'Receipt',
      color: 'orange'
    },
    {
      title: 'Kazanma Oranı',
      value: `${data?.winRate?.toFixed(1) || '0.0'}%`,
      icon: 'Target',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500/10 text-green-400 border-green-500/20',
      red: 'bg-red-500/10 text-red-400 border-red-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics?.map((metric, index) => (
        <div
          key={index}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-slate-400 mb-1">{metric?.title}</p>
              <h3 className="text-2xl font-bold text-white">{metric?.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${getColorClasses(metric?.color)}`}>
              <Icon name={metric?.icon} size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PLMetricsCards;