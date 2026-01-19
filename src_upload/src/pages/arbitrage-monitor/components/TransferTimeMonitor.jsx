import React from 'react';
import { Clock, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const TransferTimeMonitor = ({ exchanges, tradingPairs }) => {
  const getTransferTime = (pair, exchange) => {
    const baseTimes = {
      'BTC/USDT': { min: 20, max: 40 },
      'ETH/USDT': { min: 3, max: 8 },
      'XRP/USDT': { min: 2, max: 5 },
      'ADA/USDT': { min: 5, max: 15 },
      'SOL/USDT': { min: 1, max: 3 },
      'DOGE/USDT': { min: 3, max: 8 },
      'MATIC/USDT': { min: 2, max: 5 },
      'DOT/USDT': { min: 5, max: 15 },
      'AVAX/USDT': { min: 1, max: 3 },
      'LINK/USDT': { min: 3, max: 8 }
    };

    const exchangeFactors = {
      'OKX': 1.0,
      'Binance': 0.9,
      'Bybit': 1.1,
      'Gate.io': 1.2,
      'BTCTURK': 1.3
    };

    const base = baseTimes?.[pair] || { min: 5, max: 15 };
    const factor = exchangeFactors?.[exchange] || 1.0;

    return {
      min: Math.round(base?.min * factor),
      max: Math.round(base?.max * factor),
      avg: Math.round(((base?.min + base?.max) / 2) * factor)
    };
  };

  const getSpeedCategory = (avgTime) => {
    if (avgTime < 5) return { label: 'Çok Hızlı', color: 'text-success', icon: Zap };
    if (avgTime < 15) return { label: 'Hızlı', color: 'text-blue-500', icon: CheckCircle };
    if (avgTime < 30) return { label: 'Orta', color: 'text-yellow-500', icon: Clock };
    return { label: 'Yavaş', color: 'text-error', icon: AlertCircle };
  };

  const getConfirmationCount = (pair) => {
    const confirmations = {
      'BTC/USDT': 3,
      'ETH/USDT': 12,
      'XRP/USDT': 1,
      'ADA/USDT': 15,
      'SOL/USDT': 1,
      'DOGE/USDT': 6,
      'MATIC/USDT': 128,
      'DOT/USDT': 10,
      'AVAX/USDT': 1,
      'LINK/USDT': 12
    };
    return confirmations?.[pair] || 10;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-success" size={20} />
            <p className="text-sm text-muted-foreground">En Hızlı Transfer</p>
          </div>
          <p className="text-2xl font-bold text-foreground">1-3 dk</p>
          <p className="text-xs text-muted-foreground mt-1">SOL, AVAX</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-500" size={20} />
            <p className="text-sm text-muted-foreground">Ortalama Süre</p>
          </div>
          <p className="text-2xl font-bold text-foreground">8-12 dk</p>
          <p className="text-xs text-muted-foreground mt-1">Tüm borsalar</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-500" size={20} />
            <p className="text-sm text-muted-foreground">En Yavaş Transfer</p>
          </div>
          <p className="text-2xl font-bold text-foreground">20-40 dk</p>
          <p className="text-xs text-muted-foreground mt-1">BTC</p>
        </div>
      </div>
      {/* Transfer Time Matrix */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Transfer Süreleri (Dakika)</h3>
          <p className="text-sm text-muted-foreground mt-1">Blockchain onay süreleri + borsa işlem süreleri</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Coin</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Onay Sayısı</th>
                {exchanges?.map(exchange => (
                  <th key={exchange} className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    {exchange}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tradingPairs?.map(pair => {
                const coin = pair?.split('/')?.[0];
                const confirmations = getConfirmationCount(pair);
                
                return (
                  <tr key={pair} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{coin}</div>
                      <div className="text-xs text-muted-foreground">{pair}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-muted-foreground">{confirmations}</span>
                    </td>
                    {exchanges?.map(exchange => {
                      const time = getTransferTime(pair, exchange);
                      const category = getSpeedCategory(time?.avg);
                      const Icon = category?.icon;
                      
                      return (
                        <td key={exchange} className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <Icon size={14} className={category?.color} />
                              <span className={`text-sm font-medium ${category?.color}`}>
                                {time?.avg} dk
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {time?.min}-{time?.max} dk
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Speed Legend */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Hız Kategorileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Zap className="text-success" size={20} />
            <div>
              <p className="font-medium text-success">Çok Hızlı</p>
              <p className="text-xs text-muted-foreground">{'<'} 5 dakika</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-500" size={20} />
            <div>
              <p className="font-medium text-blue-500">Hızlı</p>
              <p className="text-xs text-muted-foreground">5-15 dakika</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-500" size={20} />
            <div>
              <p className="font-medium text-yellow-500">Orta</p>
              <p className="text-xs text-muted-foreground">15-30 dakika</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="text-error" size={20} />
            <div>
              <p className="font-medium text-error">Yavaş</p>
              <p className="text-xs text-muted-foreground">{'>'} 30 dakika</p>
            </div>
          </div>
        </div>
      </div>
      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-500 mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          Önemli Notlar
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-blue-500">•</span>
            <span>Transfer süreleri ağ yoğunluğuna göre değişiklik gösterebilir</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">•</span>
            <span>Bazı borsalar yüksek hacimli transferlerde ek doğrulama isteyebilir</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">•</span>
            <span>Hızlı transferler için düşük onay sayısı gerektiren coinleri tercih edin</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">•</span>
            <span>Arbitraj işlemlerinde transfer süresi kritik öneme sahiptir</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TransferTimeMonitor;