import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ConnectivityStatusPanel = ({ refreshTrigger }) => {
  const [exchanges, setExchanges] = useState([
    {
      id: 1,
      name: 'OKX',
      status: 'connected',
      latency: 45,
      uptime: 99.8,
      lastCheck: new Date(),
      websocketStatus: 'active',
      apiStatus: 'healthy'
    },
    {
      id: 2,
      name: 'Binance',
      status: 'connected',
      latency: 32,
      uptime: 99.9,
      lastCheck: new Date(),
      websocketStatus: 'active',
      apiStatus: 'healthy'
    },
    {
      id: 3,
      name: 'Bybit',
      status: 'connected',
      latency: 58,
      uptime: 99.5,
      lastCheck: new Date(),
      websocketStatus: 'active',
      apiStatus: 'healthy'
    },
    {
      id: 4,
      name: 'Gate.io',
      status: 'warning',
      latency: 125,
      uptime: 98.2,
      lastCheck: new Date(),
      websocketStatus: 'reconnecting',
      apiStatus: 'degraded'
    },
    {
      id: 5,
      name: 'BTCTURK',
      status: 'connected',
      latency: 28,
      uptime: 99.7,
      lastCheck: new Date(),
      websocketStatus: 'active',
      apiStatus: 'healthy'
    }
  ]);

  useEffect(() => {
    updateExchangeStatus();
  }, [refreshTrigger]);

  const updateExchangeStatus = () => {
    setExchanges(prev => prev?.map(exchange => {
      const latencyChange = (Math.random() - 0.5) * 20;
      const newLatency = Math.max(20, Math.min(200, exchange?.latency + latencyChange));
      const shouldDisconnect = Math.random() > 0.98;
      
      let newStatus = 'connected';
      let websocketStatus = 'active';
      let apiStatus = 'healthy';

      if (shouldDisconnect) {
        newStatus = 'disconnected';
        websocketStatus = 'disconnected';
        apiStatus = 'error';
      } else if (newLatency > 100) {
        newStatus = 'warning';
        websocketStatus = 'reconnecting';
        apiStatus = 'degraded';
      }

      return {
        ...exchange,
        latency: newLatency,
        status: newStatus,
        websocketStatus,
        apiStatus,
        lastCheck: new Date()
      };
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/10 border-green-500/50 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
      case 'disconnected':
        return 'bg-red-500/10 border-red-500/50 text-red-400';
      default:
        return 'bg-slate-500/10 border-slate-500/50 text-slate-400';
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

  const getHealthScore = () => {
    const connectedCount = exchanges?.filter(e => e?.status === 'connected')?.length;
    return ((connectedCount / exchanges?.length) * 100)?.toFixed(0);
  };

  const healthScore = getHealthScore();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Icon name="Activity" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bağlantı Durumu</h2>
            <p className="text-slate-400 text-sm">Canlı borsa bağlantıları</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{healthScore}%</div>
          <div className="text-slate-400 text-sm">Sağlık Skoru</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exchanges?.map((exchange) => (
          <div
            key={exchange?.id}
            className={`rounded-lg border p-4 transition-all hover:scale-105 ${
              getStatusColor(exchange?.status)
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name={getStatusIcon(exchange?.status)} size={20} />
                <span className="font-bold text-lg">{exchange?.name}</span>
              </div>
              <div className="text-sm font-medium">
                {exchange?.latency?.toFixed(0)}ms
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">WebSocket:</span>
                <span className="font-medium">
                  {exchange?.websocketStatus === 'active' ? '✅ Aktif' : 
                   exchange?.websocketStatus === 'reconnecting'? '🔄 Yeniden Bağlanıyor' : '❌ Kopuk'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">API Durumu:</span>
                <span className="font-medium">
                  {exchange?.apiStatus === 'healthy' ? '✅ Sağlıklı' : 
                   exchange?.apiStatus === 'degraded'? '⚠️ Yavaş' : '❌ Hata'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Çalışma Süresi:</span>
                <span className="font-medium">{exchange?.uptime}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectivityStatusPanel;