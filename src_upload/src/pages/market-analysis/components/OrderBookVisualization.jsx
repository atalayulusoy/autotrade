import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const OrderBookVisualization = () => {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [selectedPair, setSelectedPair] = useState('BTC/TRY');

  const exchanges = [
    { id: 'binance', name: 'Binance', status: 'connected' },
    { id: 'okx', name: 'OKX', status: 'connected' },
    { id: 'bybit', name: 'Bybit', status: 'connected' },
    { id: 'gateio', name: 'Gate.io', status: 'connected' },
    { id: 'btcturk', name: 'BTCTURK', status: 'connected' }
  ];

  const tradingPairs = ['BTC/TRY', 'ETH/TRY', 'BNB/TRY', 'SOL/TRY', 'XRP/TRY'];

  const orderBookData = {
    bids: [
      { price: 2502000, amount: 0.5234, total: 1309051, percentage: 95 },
      { price: 2501500, amount: 0.8421, total: 2106763, percentage: 88 },
      { price: 2501000, amount: 1.2345, total: 3087234, percentage: 82 },
      { price: 2500500, amount: 0.6789, total: 1697839, percentage: 75 },
      { price: 2500000, amount: 2.1456, total: 5364000, percentage: 68 },
      { price: 2499500, amount: 0.9876, total: 2468502, percentage: 60 },
      { price: 2499000, amount: 1.5432, total: 3856317, percentage: 52 },
      { price: 2498500, amount: 0.7654, total: 1912346, percentage: 45 }
    ],
    asks: [
      { price: 2502500, amount: 0.4567, total: 1142641, percentage: 42 },
      { price: 2503000, amount: 0.8234, total: 2060750, percentage: 50 },
      { price: 2503500, amount: 1.1234, total: 2812093, percentage: 58 },
      { price: 2504000, amount: 0.5678, total: 1421627, percentage: 65 },
      { price: 2504500, amount: 1.8765, total: 4700093, percentage: 72 },
      { price: 2505000, amount: 0.9123, total: 2285332, percentage: 80 },
      { price: 2505500, amount: 1.4567, total: 3649268, percentage: 87 },
      { price: 2506000, amount: 0.6789, total: 1701253, percentage: 93 }
    ],
    spread: 500,
    spreadPercentage: 0.02
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Emir Defteri</h2>
          <p className="caption text-muted-foreground">Borsalar arasında gerçek zamanlı alım/satım derinliği</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e?.target?.value)}
            className="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {exchanges?.map((exchange) => (
              <option key={exchange?.id} value={exchange?.id}>
                {exchange?.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e?.target?.value)}
            className="px-4 py-2 rounded-lg bg-muted text-foreground border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {tradingPairs?.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-muted rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="caption text-muted-foreground mb-1">Spread</p>
            <p className="data-text text-base md:text-lg font-semibold text-foreground">
              ₺{orderBookData?.spread?.toLocaleString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="caption text-muted-foreground mb-1">Spread %</p>
            <p className="data-text text-base md:text-lg font-semibold text-warning">
              {orderBookData?.spreadPercentage?.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="caption text-muted-foreground mb-1">Toplam Alım</p>
            <p className="data-text text-base md:text-lg font-semibold text-success">
              {orderBookData?.bids?.length}
            </p>
          </div>
          <div>
            <p className="caption text-muted-foreground mb-1">Toplam Satım</p>
            <p className="data-text text-base md:text-lg font-semibold text-error">
              {orderBookData?.asks?.length}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base md:text-lg font-semibold text-success">Alım Emirleri</h3>
            <Icon name="TrendingUp" size={18} className="text-success" />
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border">
              <span className="caption text-muted-foreground">Fiyat (TRY)</span>
              <span className="caption text-muted-foreground text-right">Miktar</span>
              <span className="caption text-muted-foreground text-right">Toplam (TRY)</span>
            </div>
            {orderBookData?.bids?.map((bid, index) => (
              <div key={index} className="relative">
                <div
                  className="absolute inset-0 bg-success opacity-10 rounded"
                  style={{ width: `${bid?.percentage}%` }}
                />
                <div className="relative grid grid-cols-3 gap-2 py-2 px-2 hover:bg-muted rounded transition-colors">
                  <span className="data-text text-xs md:text-sm text-success font-medium">
                    {bid?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="data-text text-xs md:text-sm text-foreground text-right">
                    {bid?.amount?.toFixed(4)}
                  </span>
                  <span className="data-text text-xs md:text-sm text-muted-foreground text-right">
                    {bid?.total?.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base md:text-lg font-semibold text-error">Satım Emirleri</h3>
            <Icon name="TrendingDown" size={18} className="text-error" />
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border">
              <span className="caption text-muted-foreground">Fiyat (TRY)</span>
              <span className="caption text-muted-foreground text-right">Miktar</span>
              <span className="caption text-muted-foreground text-right">Toplam (TRY)</span>
            </div>
            {orderBookData?.asks?.map((ask, index) => (
              <div key={index} className="relative">
                <div
                  className="absolute inset-0 bg-error opacity-10 rounded"
                  style={{ width: `${ask?.percentage}%` }}
                />
                <div className="relative grid grid-cols-3 gap-2 py-2 px-2 hover:bg-muted rounded transition-colors">
                  <span className="data-text text-xs md:text-sm text-error font-medium">
                    {ask?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="data-text text-xs md:text-sm text-foreground text-right">
                    {ask?.amount?.toFixed(4)}
                  </span>
                  <span className="data-text text-xs md:text-sm text-muted-foreground text-right">
                    {ask?.total?.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBookVisualization;