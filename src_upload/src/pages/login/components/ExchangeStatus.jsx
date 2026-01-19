import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ExchangeStatus = () => {
  const [exchanges, setExchanges] = useState([
    { name: 'BTCTURK', status: 'connected', icon: 'Bitcoin' },
    { name: 'Binance', status: 'connected', icon: 'TrendingUp' },
    { name: 'OKX', status: 'connected', icon: 'BarChart3' },
    { name: 'Bybit', status: 'connected', icon: 'LineChart' },
    { name: 'Gate.io', status: 'connected', icon: 'Activity' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setExchanges(prev => prev?.map(exchange => {
        // Çok düşük bağlantı kopma olasılığı (2%)
        const shouldDisconnect = Math.random() > 0.98;
        
        // Eğer bağlantı kopmuşsa, otomatik yeniden bağlan
        if (exchange?.status === 'disconnected') {
          return { ...exchange, status: 'connected' };
        }
        
        return {
          ...exchange,
          status: shouldDisconnect ? 'disconnected' : 'connected'
        };
      }));
    }, 10000); // 10 saniyede bir kontrol

    return () => clearInterval(interval);
  }, []);

  const connectedCount = exchanges?.filter(e => e?.status === 'connected')?.length;

  return (
    <div className="p-4 md:p-6 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-foreground">
          Borsa Bağlantı Durumu
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${connectedCount === exchanges?.length ? 'bg-success' : 'bg-warning'} animate-pulse`} />
          <span className="text-xs md:text-sm font-medium text-foreground">
            {connectedCount}/{exchanges?.length} Aktif
          </span>
        </div>
      </div>
      <div className="space-y-2 md:space-y-3">
        {exchanges?.map((exchange, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10">
                <Icon name={exchange?.icon} size={18} className="text-primary" />
              </div>
              <span className="text-sm md:text-base font-medium text-foreground">
                {exchange?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${exchange?.status === 'connected' ? 'bg-success' : 'bg-error'}`} />
              <span className={`text-xs md:text-sm ${exchange?.status === 'connected' ? 'text-success' : 'text-error'}`}>
                {exchange?.status === 'connected' ? 'Bağlı' : 'Yeniden Bağlanıyor...'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2 md:gap-3">
          <Icon name="Info" size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-muted-foreground">
            Tüm borsalar otomatik olarak bağlanır. Geçici bağlantı kopmaları otomatik olarak düzeltilir. Kalıcı sorunlar için sistem yöneticisi ile iletişime geçiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExchangeStatus;