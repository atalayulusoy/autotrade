import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      id: 1,
      title: 'Toplam İşlem',
      value: summary?.totalTrades?.toLocaleString('tr-TR'),
      icon: 'Activity',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 2,
      title: 'Başarı Oranı',
      value: `${summary?.successRate?.toFixed(2)}%`,
      icon: 'TrendingUp',
      iconColor: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 3,
      title: 'Toplam Kar/Zarar',
      value: `₺${summary?.totalProfitLoss?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: summary?.totalProfitLoss >= 0 ? 'ArrowUp' : 'ArrowDown',
      iconColor: summary?.totalProfitLoss >= 0 ? 'text-success' : 'text-error',
      bgColor: summary?.totalProfitLoss >= 0 ? 'bg-success/10' : 'bg-error/10',
      valueColor: summary?.totalProfitLoss >= 0 ? 'text-success' : 'text-error'
    },
    {
      id: 4,
      title: 'Ortalama İşlem Hacmi',
      value: `₺${summary?.avgVolume?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: 'BarChart3',
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card rounded-lg border border-border p-4 md:p-6 hover:border-primary/50 transition-all duration-250"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${card?.bgColor}`}>
              <Icon name={card?.icon} size={24} className={card?.iconColor} />
            </div>
          </div>
          <p className="caption text-muted-foreground mb-2">{card?.title}</p>
          <p className={`text-2xl md:text-3xl font-semibold ${card?.valueColor || 'text-foreground'}`}>
            {card?.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;