import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import ConnectivityStatusPanel from './components/ConnectivityStatusPanel';
import LatencyMetricsPanel from './components/LatencyMetricsPanel';
import ReconnectionLogsPanel from './components/ReconnectionLogsPanel';
import FailoverStatusPanel from './components/FailoverStatusPanel';

const SystemHealthMonitor = () => {
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Sistem Sağlık İzleyici
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Çoklu borsa bağlantı durumu ve sistem performansı izleme
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm">Canlı</span>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-slate-400" />
                  <span className="text-slate-300 text-sm">{formatTime(lastRefresh)}</span>
                </div>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e?.target?.value))}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value={3000}>3s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>
          </div>

          {/* Connectivity Status Panel */}
          <ConnectivityStatusPanel refreshTrigger={lastRefresh} />

          {/* Latency Metrics and Failover Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LatencyMetricsPanel refreshTrigger={lastRefresh} />
            <FailoverStatusPanel />
          </div>

          {/* Reconnection Logs */}
          <ReconnectionLogsPanel refreshTrigger={lastRefresh} />
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemHealthMonitor;