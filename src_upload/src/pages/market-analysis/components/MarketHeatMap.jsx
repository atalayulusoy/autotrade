import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const MarketHeatMap = () => {
  const [selectedView, setSelectedView] = useState('performance');

  const views = [
    { id: 'performance', label: 'Performance', icon: 'TrendingUp' },
    { id: 'volume', label: 'Volume', icon: 'BarChart3' },
    { id: 'correlation', label: 'Correlation', icon: 'Network' }
  ];

  const heatMapData = [
    { symbol: 'BTC', name: 'Bitcoin', value: 2.45, size: 45, category: 'Layer 1' },
    { symbol: 'ETH', name: 'Ethereum', value: 3.12, size: 35, category: 'Layer 1' },
    { symbol: 'BNB', name: 'Binance', value: 1.87, size: 25, category: 'Exchange' },
    { symbol: 'SOL', name: 'Solana', value: -1.23, size: 20, category: 'Layer 1' },
    { symbol: 'XRP', name: 'Ripple', value: 4.56, size: 18, category: 'Payment' },
    { symbol: 'ADA', name: 'Cardano', value: -2.34, size: 15, category: 'Layer 1' },
    { symbol: 'AVAX', name: 'Avalanche', value: 1.45, size: 12, category: 'Layer 1' },
    { symbol: 'DOT', name: 'Polkadot', value: -0.87, size: 10, category: 'Layer 0' },
    { symbol: 'MATIC', name: 'Polygon', value: 2.34, size: 10, category: 'Layer 2' },
    { symbol: 'LINK', name: 'Chainlink', value: 1.23, size: 8, category: 'Oracle' },
    { symbol: 'UNI', name: 'Uniswap', value: -1.56, size: 8, category: 'DeFi' },
    { symbol: 'ATOM', name: 'Cosmos', value: 0.98, size: 7, category: 'Layer 0' }
  ];

  const getColorIntensity = (value) => {
    if (value >= 3) return 'bg-success/90';
    if (value >= 1.5) return 'bg-success/70';
    if (value >= 0) return 'bg-success/40';
    if (value >= -1.5) return 'bg-error/40';
    if (value >= -3) return 'bg-error/70';
    return 'bg-error/90';
  };

  const categories = [...new Set(heatMapData.map(item => item.category))];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Market Heat Map</h2>
          <p className="caption text-muted-foreground">Sector performance and correlation analysis</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {views?.map((view) => (
            <button
              key={view?.id}
              onClick={() => setSelectedView(view?.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-250 whitespace-nowrap ${
                selectedView === view?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-card hover:text-foreground'
              }`}
            >
              <Icon name={view?.icon} size={16} />
              {view?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {categories?.map((category) => (
          <div key={category} className="bg-muted rounded-lg p-3">
            <p className="caption text-muted-foreground mb-1">{category}</p>
            <p className="text-base md:text-lg font-semibold text-foreground">
              {heatMapData?.filter(item => item?.category === category)?.length} coins
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {heatMapData?.map((item) => (
          <div
            key={item?.symbol}
            className={`relative rounded-lg p-3 md:p-4 transition-all duration-250 hover:scale-105 cursor-pointer ${getColorIntensity(
              item?.value
            )}`}
            style={{
              minHeight: `${80 + item?.size}px`
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base mb-1">
                  {item?.symbol}
                </p>
                <p className="caption text-foreground/80 line-clamp-1">{item?.name}</p>
              </div>
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <Icon
                    name={item?.value >= 0 ? 'TrendingUp' : 'TrendingDown'}
                    size={14}
                    className="text-foreground"
                  />
                  <span className="data-text text-base md:text-lg font-bold text-foreground">
                    {item?.value >= 0 ? '+' : ''}
                    {item?.value?.toFixed(2)}%
                  </span>
                </div>
                <span className="caption text-foreground/70">{item?.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/90" />
            <span className="caption text-muted-foreground">Strong Gain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/40" />
            <span className="caption text-muted-foreground">Moderate Gain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-error/40" />
            <span className="caption text-muted-foreground">Moderate Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-error/90" />
            <span className="caption text-muted-foreground">Strong Loss</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-card transition-colors">
          <Icon name="Download" size={16} />
          <span className="text-sm font-medium hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};

export default MarketHeatMap;