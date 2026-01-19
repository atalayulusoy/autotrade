import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ExchangeStatusBar = () => {
  const [exchanges, setExchanges] = useState([
    {
      id: 1,
      name: 'OKX',
      status: 'connected',
      latency: 45,
      lastUpdate: new Date()
    },
    {
      id: 2,
      name: 'Binance',
      status: 'connected',
      latency: 32,
      lastUpdate: new Date()
    },
    {
      id: 3,
      name: 'Bybit',
      status: 'connected',
      latency: 58,
      lastUpdate: new Date()
    },
    {
      id: 4,
      name: 'Gate.io',
      status: 'warning',
      latency: 125,
      lastUpdate: new Date()
    },
    {
      id: 5,
      name: 'BTCTURK',
      status: 'connected',
      latency: 28,
      lastUpdate: new Date()
    }
  ]);

  const [signalStatus, setSignalStatus] = useState({
    tradingView: 'active',
    lastSignal: new Date(Date.now() - 300000),
    signalsToday: 47
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setExchanges(prevExchanges =>
        prevExchanges?.map(exchange => ({
          ...exchange,
          latency: Math.max(20, exchange?.latency + (Math.random() - 0.5) * 20),
          status: exchange?.latency > 100 ? 'warning' : 'connected',
          lastUpdate: new Date()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'disconnected':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle2';
      case 'warning':
        return 'AlertTriangle';
      case 'disconnected':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const formatTimeSince = (date) => {
    const seconds = Math.floor((Date.now() - date?.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s önce`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}d önce`;
    const hours = Math.floor(minutes / 60);
    return `${hours}s önce`;
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Activity" size={20} className="text-primary" />
              <span className="text-sm md:text-base font-semibold text-foreground">Borsa Bağlantıları</span>
            </div>
            <div className="h-6 w-px bg-border hidden md:block" />
            <div className="flex flex-wrap gap-2 md:gap-3">
              {exchanges?.map((exchange) => (
                <div
                  key={exchange?.id}
                  className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg ${getStatusColor(exchange?.status)}`}
                >
                  <Icon name={getStatusIcon(exchange?.status)} size={14} />
                  <span className="text-xs md:text-sm font-medium">{exchange?.name}</span>
                  <span className="text-xs opacity-75">{exchange?.latency?.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-6 w-px bg-border hidden lg:block" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
              <Icon name="Radio" size={14} />
              <span className="text-xs md:text-sm font-medium">TradingView</span>
              <span className="text-xs opacity-75">{signalStatus?.signalsToday} sinyal</span>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              Son sinyal: {formatTimeSince(signalStatus?.lastSignal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeStatusBar;