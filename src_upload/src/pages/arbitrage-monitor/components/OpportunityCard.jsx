import React from 'react';
import { TrendingUp, Clock, AlertTriangle, Zap, ArrowRight, Play } from 'lucide-react';
import Button from '../../../components/ui/Button';

const OpportunityCard = ({ opportunity, onActivate }) => {
  const getRiskColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-yellow-500';
    return 'text-error';
  };

  const getRiskLabel = (score) => {
    if (score >= 80) return 'Düşük Risk';
    if (score >= 60) return 'Orta Risk';
    return 'Yüksek Risk';
  };

  const getSpeedLabel = (minutes) => {
    if (minutes < 5) return 'Çok Hızlı';
    if (minutes < 15) return 'Hızlı';
    return 'Orta';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Pair & Exchanges */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-foreground">{opportunity?.symbol}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              opportunity?.profit_percentage >= 2 ? 'bg-success/20 text-success' :
              opportunity?.profit_percentage >= 1 ? 'bg-yellow-500/20 text-yellow-500': 'bg-blue-500/20 text-blue-500'
            }`}>
              +{opportunity?.profit_percentage?.toFixed(2)}% Spread
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Al:</span>
              <span className="font-medium text-success">{opportunity?.buy_exchange}</span>
              <span className="text-foreground font-mono">${opportunity?.buy_price?.toFixed(2)}</span>
            </div>
            <ArrowRight size={16} className="text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sat:</span>
              <span className="font-medium text-error">{opportunity?.sell_exchange}</span>
              <span className="text-foreground font-mono">${opportunity?.sell_price?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Middle Section - Metrics */}
        <div className="flex flex-wrap gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Tahmini Kar</p>
            <p className="text-lg font-bold text-success">+{opportunity?.estimatedProfit}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">İşlem Hızı</p>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-blue-500" />
              <p className="text-sm font-medium text-foreground">
                ~{opportunity?.executionSpeed} dk
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getSpeedLabel(opportunity?.executionSpeed)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Skoru</p>
            <div className="flex items-center gap-1">
              <AlertTriangle size={16} className={getRiskColor(opportunity?.riskScore)} />
              <p className={`text-sm font-medium ${getRiskColor(opportunity?.riskScore)}`}>
                {opportunity?.riskScore}/100
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{getRiskLabel(opportunity?.riskScore)}</p>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onActivate(opportunity)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          >
            <Play size={16} />
            Bot Aktifleştir
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Otomatik işlem başlat
          </p>
        </div>
      </div>

      {/* Bottom Section - Additional Info */}
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Tespit: {new Date(opportunity?.detected_at)?.toLocaleTimeString('tr-TR')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap size={14} />
          <span>Geçerlilik: {Math.floor((new Date(opportunity?.expires_at) - new Date()) / 60000)} dk</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={14} />
          <span>Fiyat Farkı: ${(opportunity?.sell_price - opportunity?.buy_price)?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;