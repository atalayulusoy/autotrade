import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ReconnectionLogsPanel = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('1h');

  const exchanges = ['all', 'OKX', 'Binance', 'Bybit', 'Gate.io', 'BTCTURK'];

  useEffect(() => {
    generateLogs();
  }, [refreshTrigger]);

  const generateLogs = () => {
    const newLogs = [];
    const now = Date.now();
    const exchangeList = ['OKX', 'Binance', 'Bybit', 'Gate.io', 'BTCTURK'];
    const reasons = [
      'Ağ zaman aşımı',
      'WebSocket bağlantısı koptu',
      'API hız limiti aşıldı',
      'Sunucu yanıt vermiyor',
      'Kimlik doğrulama hatası'
    ];
    const statuses = ['success', 'failed', 'retrying'];

    for (let i = 0; i < 15; i++) {
      const exchange = exchangeList?.[Math.floor(Math.random() * exchangeList?.length)];
      const reason = reasons?.[Math.floor(Math.random() * reasons?.length)];
      const status = statuses?.[Math.floor(Math.random() * statuses?.length)];
      const timestamp = new Date(now - Math.random() * 3600000);

      newLogs?.push({
        id: i + 1,
        exchange,
        reason,
        status,
        timestamp,
        attemptCount: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 5000) + 500
      });
    }

    newLogs?.sort((a, b) => b?.timestamp - a?.timestamp);
    setLogs(newLogs);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/50';
      case 'retrying':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return 'CheckCircle2';
      case 'failed':
        return 'XCircle';
      case 'retrying':
        return 'RefreshCw';
      default:
        return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Başarılı';
      case 'failed':
        return 'Başarısız';
      case 'retrying':
        return 'Yeniden Deneniyor';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return date?.toLocaleDateString('tr-TR');
  };

  const filteredLogs = logs?.filter(log => {
    if (filter !== 'all' && log?.exchange !== filter) return false;
    return true;
  });

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
            <Icon name="FileText" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Yeniden Bağlanma Kayıtları</h2>
            <p className="text-slate-400 text-sm">Bağlantı denemeleri ve sonuçları</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e?.target?.value)}
            className="bg-slate-700/50 rounded-lg px-3 py-2 text-slate-300 text-sm border border-slate-600/50 focus:outline-none focus:border-blue-500"
          >
            {exchanges?.map(ex => (
              <option key={ex} value={ex}>
                {ex === 'all' ? 'Tüm Borsalar' : ex}
              </option>
            ))}
          </select>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e?.target?.value)}
            className="bg-slate-700/50 rounded-lg px-3 py-2 text-slate-300 text-sm border border-slate-600/50 focus:outline-none focus:border-blue-500"
          >
            <option value="1h">Son 1 Saat</option>
            <option value="6h">Son 6 Saat</option>
            <option value="24h">Son 24 Saat</option>
            <option value="7d">Son 7 Gün</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs?.map((log) => (
          <div
            key={log?.id}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-white">{log?.exchange}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(log?.status)}`}>
                    <Icon name={getStatusIcon(log?.status)} size={12} className="inline mr-1" />
                    {getStatusText(log?.status)}
                  </span>
                  <span className="text-slate-400 text-xs">{formatTimestamp(log?.timestamp)}</span>
                </div>
                <p className="text-slate-300 text-sm mb-2">{log?.reason}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Deneme: {log?.attemptCount}</span>
                  <span>•</span>
                  <span>Süre: {(log?.duration / 1000)?.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs?.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Icon name="Inbox" size={48} className="mx-auto mb-2 opacity-50" />
          <p>Kayıt bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default ReconnectionLogsPanel;