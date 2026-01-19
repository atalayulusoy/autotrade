import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const CoinListPanel = ({ onCoinSelect, selectedCoin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('volume');
  const [coins, setCoins] = useState([
    {
      id: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      pair: 'BTC/TRY',
      price: 2847563.45,
      change24h: 3.24,
      volume24h: 1847563000,
      high24h: 2895000,
      low24h: 2756000,
      lastUpdate: new Date()
    },
    {
      id: 2,
      symbol: 'ETH',
      name: 'Ethereum',
      pair: 'ETH/TRY',
      price: 124567.89,
      change24h: -1.45,
      volume24h: 987654000,
      high24h: 128900,
      low24h: 122300,
      lastUpdate: new Date()
    },
    {
      id: 3,
      symbol: 'XRP',
      name: 'Ripple',
      pair: 'XRP/TRY',
      price: 12.34,
      change24h: 5.67,
      volume24h: 456789000,
      high24h: 13.45,
      low24h: 11.23,
      lastUpdate: new Date()
    },
    {
      id: 4,
      symbol: 'ADA',
      name: 'Cardano',
      pair: 'ADA/TRY',
      price: 8.76,
      change24h: 2.34,
      volume24h: 234567000,
      high24h: 9.12,
      low24h: 8.34,
      lastUpdate: new Date()
    },
    {
      id: 5,
      symbol: 'SOL',
      name: 'Solana',
      pair: 'SOL/TRY',
      price: 4567.89,
      change24h: -3.21,
      volume24h: 567890000,
      high24h: 4789.00,
      low24h: 4456.00,
      lastUpdate: new Date()
    },
    {
      id: 6,
      symbol: 'DOGE',
      name: 'Dogecoin',
      pair: 'DOGE/TRY',
      price: 2.45,
      change24h: 8.90,
      volume24h: 345678000,
      high24h: 2.67,
      low24h: 2.23,
      lastUpdate: new Date()
    },
    {
      id: 7,
      symbol: 'AVAX',
      name: 'Avalanche',
      pair: 'AVAX/TRY',
      price: 1234.56,
      change24h: 4.56,
      volume24h: 456789000,
      high24h: 1289.00,
      low24h: 1178.00,
      lastUpdate: new Date()
    },
    {
      id: 8,
      symbol: 'DOT',
      name: 'Polkadot',
      pair: 'DOT/TRY',
      price: 234.56,
      change24h: -2.34,
      volume24h: 234567000,
      high24h: 245.00,
      low24h: 228.00,
      lastUpdate: new Date()
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => 
        prevCoins?.map(coin => ({
          ...coin,
          price: coin?.price * (1 + (Math.random() - 0.5) * 0.002),
          change24h: coin?.change24h + (Math.random() - 0.5) * 0.5,
          lastUpdate: new Date()
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(price);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000)?.toFixed(2)}B`;
    }
    if (volume >= 1000000) {
      return `${(volume / 1000000)?.toFixed(2)}M`;
    }
    return `${(volume / 1000)?.toFixed(2)}K`;
  };

  const filteredCoins = coins?.filter(coin =>
    coin?.symbol?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    coin?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    coin?.pair?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const sortedCoins = [...filteredCoins]?.sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b?.volume24h - a?.volume24h;
      case 'change':
        return b?.change24h - a?.change24h;
      case 'price':
        return b?.price - a?.price;
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Coin Listesi</h2>
        
        <div className="relative mb-4">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Coin ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 md:py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm md:text-base"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('volume')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              sortBy === 'volume' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-card'
            }`}
          >
            Hacim
          </button>
          <button
            onClick={() => setSortBy('change')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              sortBy === 'change' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-card'
            }`}
          >
            Değişim
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
              sortBy === 'price' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-card'
            }`}
          >
            Fiyat
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sortedCoins?.map((coin) => (
          <button
            key={coin?.id}
            onClick={() => onCoinSelect(coin)}
            className={`w-full p-3 md:p-4 border-b border-border hover:bg-muted transition-all text-left ${
              selectedCoin === coin?.pair || selectedCoin === `${coin?.symbol}/USDT` ? 'bg-muted' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs md:text-sm font-bold text-primary">{coin?.symbol?.substring(0, 2)}</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">{coin?.symbol}</div>
                  <div className="text-xs text-muted-foreground">{coin?.pair}</div>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs md:text-sm font-medium ${
                coin?.change24h >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'
              }`}>
                <Icon name={coin?.change24h >= 0 ? 'TrendingUp' : 'TrendingDown'} size={14} />
                {Math.abs(coin?.change24h)?.toFixed(2)}%
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm md:text-base font-bold text-foreground">
                  ₺{formatPrice(coin?.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Hacim: {formatVolume(coin?.volume24h)} TRY
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">24s Yüksek</div>
                <div className="text-xs font-medium text-success">₺{formatPrice(coin?.high24h)}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CoinListPanel;
