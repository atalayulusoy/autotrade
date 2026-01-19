import React from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceMetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  description,
  trend = []
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 hover:border-primary/50 transition-all duration-250">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1">
          <p className="caption text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground data-text">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10">
            <Icon name={icon} size={20} color="var(--color-primary)" />
          </div>
        )}
      </div>
      {change && (
        <div className="flex items-center gap-2 mb-2">
          <Icon name={getChangeIcon()} size={16} className={getChangeColor()} />
          <span className={`caption font-medium ${getChangeColor()}`}>
            {change}
          </span>
        </div>
      )}
      {description && (
        <p className="caption text-muted-foreground">{description}</p>
      )}
      {trend?.length > 0 && (
        <div className="mt-3 flex items-end gap-1 h-8">
          {trend?.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-primary/20 rounded-sm"
              style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceMetricCard;