import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import MarketOverviewChart from './components/MarketOverviewChart';
import OrderBookVisualization from './components/OrderBookVisualization';
import MarketScreener from './components/MarketScreener';
import MarketHeatMap from './components/MarketHeatMap';
import TechnicalAnalysisTools from './components/TechnicalAnalysisTools';
import MarketNewsWidget from './components/MarketNewsWidget';
import PriceAlertConfiguration from './components/PriceAlertConfiguration';
import CoinSelector from './components/CoinSelector';
import Icon from '../../components/AppIcon';
import { apiUrl } from '../../services/apiBase';

const MarketAnalysis = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [marketSnapshot, setMarketSnapshot] = useState({ usdtTry: 0, prices: {} });

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: 'LayoutDashboard' },
    { id: 'orderbook', label: 'Emir Defteri', icon: 'BookOpen' },
    { id: 'screener', label: 'Tarayıcı', icon: 'Filter' },
    { id: 'heatmap', label: 'Isı Haritası', icon: 'Grid3x3' },
    { id: 'technical', label: 'Teknik Analiz', icon: 'Activity' },
    { id: 'news', label: 'Haberler', icon: 'Newspaper' },
    { id: 'alerts', label: 'Uyarılar', icon: 'Bell' }
  ];

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin);
  };

  useEffect(() => {
    let alive = true;
    const loadSnapshot = async () => {
      try {
        const res = await fetch(apiUrl('/api/public/ticker'));
        const data = await res.json();
        if (!alive) return;
        setMarketSnapshot({
          usdtTry: Number(data?.usdt_try || 0),
          prices: data?.prices || {}
        });
      } catch (error) {
        if (alive) {
          setMarketSnapshot({ usdtTry: 0, prices: {} });
        }
      }
    };
    loadSnapshot();
    const interval = setInterval(loadSnapshot, 5000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MarketOverviewChart selectedCoin={selectedCoin} />;
      case 'orderbook':
        return <OrderBookVisualization />;
      case 'screener':
        return <MarketScreener />;
      case 'heatmap':
        return <MarketHeatMap />;
      case 'technical':
        return <TechnicalAnalysisTools />;
      case 'news':
        return <MarketNewsWidget />;
      case 'alerts':
        return <PriceAlertConfiguration />;
      default:
        return <MarketOverviewChart selectedCoin={selectedCoin} />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
              Piyasa Analizi
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Kapsamlı kripto para piyasa istihbaratı
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-card border border-border">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs sm:text-sm text-muted-foreground">Canlı Veri</span>
            </div>
            <button className="btn-touch-secondary flex items-center gap-2">
              <Icon name="Download" size={18} />
              <span className="text-sm font-medium hidden sm:inline">Dışa Aktar</span>
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <CoinSelector onCoinSelect={handleCoinSelect} selectedCoin={selectedCoin} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(marketSnapshot?.prices || {}).slice(0, 4).map(([symbol, price]) => (
            <div key={symbol} className="bg-card border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">{symbol}</div>
              <div className="text-lg font-semibold text-foreground">${Number(price || 0).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                ₺{Number((price || 0) * (marketSnapshot?.usdtTry || 0)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="table-mobile-wrapper">
          <div className="flex gap-2 pb-2 border-b border-border">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg text-xs sm:text-sm font-medium transition-all duration-250 whitespace-nowrap min-h-touch ${
                  activeTab === tab?.id
                    ? 'bg-card text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span className="hidden xs:inline">{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">{renderContent()}</div>
      </div>
    </MainLayout>
  );
};

export default MarketAnalysis;
