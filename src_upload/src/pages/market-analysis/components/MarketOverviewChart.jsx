import React from 'react';
import CandlestickChart from '../../trading-dashboard/components/CandlestickChart';

const MarketOverviewChart = ({ selectedCoin }) => {
  const symbol = selectedCoin?.symbol ? `${selectedCoin?.symbol}/USDT` : 'BTC/USDT';

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg bg-card border border-border">
        <CandlestickChart symbol={symbol} timeframe="1H" height={360} />
      </div>
    </div>
  );
};

export default MarketOverviewChart;
