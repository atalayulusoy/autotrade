import React, { useState } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import Icon from '../../../components/AppIcon';

const RecommendationCard = ({ recommendation }) => {
  const getSignalColor = (type) => {
    if (type === 'BUY') return 'text-success bg-success/10';
    if (type === 'SELL') return 'text-error bg-error/10';
    return 'text-warning bg-warning/10';
  };

  const getRiskColor = (level) => {
    if (level === 'Düşük') return 'text-success';
    if (level === 'Orta') return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="card-mobile hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm sm:text-lg font-bold text-primary">{recommendation?.symbol?.split('/')?.[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{recommendation?.symbol}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{recommendation?.exchange}</p>
          </div>
        </div>
        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getSignalColor(recommendation?.signalType)}`}>
          {recommendation?.signalType}
        </div>
      </div>

      {/* Sentiment Analysis */}
      {recommendation?.sentimentAnalysis && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={14} className="text-blue-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-blue-400">Piyasa Duyarlılığı</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground line-clamp-3">{recommendation?.sentimentAnalysis}</p>
        </div>
      )}

      {/* Technical Patterns */}
      {recommendation?.technicalPatterns?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Activity" size={14} className="text-purple-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-purple-400">Teknik Paternler</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation?.technicalPatterns?.map((pattern, idx) => (
              <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risk-Reward Ratio */}
      {recommendation?.riskRewardRatio && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Risk-Ödül Oranı</span>
            <span className="text-xs sm:text-sm font-medium text-foreground">{recommendation?.riskRewardRatio}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        <div className="bg-muted rounded-lg p-2 sm:p-3">
          <p className="text-xs text-muted-foreground mb-1">Giriş Fiyatı</p>
          <p className="text-sm sm:text-base font-semibold text-foreground truncate">${recommendation?.entryPrice?.toFixed(2)}</p>
        </div>
        <div className="bg-muted rounded-lg p-2 sm:p-3">
          <p className="text-xs text-muted-foreground mb-1">Güven Skoru</p>
          <p className="text-sm sm:text-base font-semibold text-success">{recommendation?.confidence?.toFixed(0)}%</p>
        </div>
        <div className="bg-muted rounded-lg p-2 sm:p-3">
          <p className="text-xs text-muted-foreground mb-1">Kar Hedefi</p>
          <p className="text-sm sm:text-base font-semibold text-success">+{recommendation?.profitTarget?.toFixed(1)}%</p>
        </div>
        <div className="bg-muted rounded-lg p-2 sm:p-3">
          <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
          <p className="text-sm sm:text-base font-semibold text-error">-{recommendation?.stopLoss?.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Risk Seviyesi:</span>
          <span className={`text-xs sm:text-sm font-medium ${getRiskColor(recommendation?.riskLevel)}`}>
            {recommendation?.riskLevel}
          </span>
        </div>
        <button className="btn-touch-primary bg-primary text-primary-foreground w-full sm:w-auto">
          <span className="text-sm">İşlem Yap</span>
        </button>
      </div>

      <div className="mt-3 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">AI Analizi</p>
        <p className="text-xs sm:text-sm text-foreground line-clamp-3">{recommendation?.analysis}</p>
      </div>
    </div>
  );
};

export default RecommendationCard;