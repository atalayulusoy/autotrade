import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MarketScreener = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');

  const filters = [
  { id: 'all', label: 'Tüm Coinler', icon: 'Coins' },
  { id: 'gainers', label: 'En Çok Kazananlar', icon: 'TrendingUp' },
  { id: 'losers', label: 'En Çok Kaybedenler', icon: 'TrendingDown' },
  { id: 'volume', label: 'Yüksek Hacim', icon: 'BarChart3' },
  { id: 'new', label: 'Yeni Listeler', icon: 'Sparkles' }];


  const cryptocurrencies = [
  {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    image: "https://images.unsplash.com/photo-1631865382441-b00105810564",
    imageAlt: 'Golden Bitcoin cryptocurrency coin with B symbol on dark background',
    price: 2502000,
    change24h: 2.45,
    volume24h: 158000000,
    marketCap: 1902000000000,
    high24h: 2502000,
    low24h: 2442000,
    signal: 'buy'
  },
  {
    id: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_117ea879d-1767158662331.png",
    imageAlt: 'Silver Ethereum cryptocurrency coin with diamond logo on blue gradient background',
    price: 152500,
    change24h: 3.12,
    volume24h: 89000000,
    marketCap: 845000000000,
    high24h: 152500,
    low24h: 144200,
    signal: 'buy'
  },
  {
    id: 3,
    symbol: 'BNB',
    name: 'Binance Coin',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ce1ad32e-1768207143822.png",
    imageAlt: 'Yellow and black Binance BNB cryptocurrency coin with geometric logo design',
    price: 19800,
    change24h: 1.87,
    volume24h: 45000000,
    marketCap: 312000000000,
    high24h: 19800,
    low24h: 18200,
    signal: 'hold'
  },
  {
    id: 4,
    symbol: 'SOL',
    name: 'Solana',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_177f2f31c-1764668863231.png",
    imageAlt: 'Purple and blue gradient Solana cryptocurrency coin with circular logo pattern',
    price: 6850,
    change24h: -1.23,
    volume24h: 32000000,
    marketCap: 156000000000,
    high24h: 7120,
    low24h: 6850,
    signal: 'sell'
  },
  {
    id: 5,
    symbol: 'XRP',
    name: 'Ripple',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c2c06092-1766586872506.png",
    imageAlt: 'Silver XRP Ripple cryptocurrency coin with three connected circles logo on dark surface',
    price: 18.45,
    change24h: 4.56,
    volume24h: 28000000,
    marketCap: 98000000000,
    high24h: 18.45,
    low24h: 17.12,
    signal: 'buy'
  },
  {
    id: 6,
    symbol: 'ADA',
    name: 'Cardano',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_17fb25089-1764668867591.png",
    imageAlt: 'Blue Cardano ADA cryptocurrency coin with circular geometric pattern logo',
    price: 15.23,
    change24h: -2.34,
    volume24h: 18000000,
    marketCap: 67000000000,
    high24h: 16.12,
    low24h: 15.23,
    signal: 'hold'
  }];


  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'buy':
        return 'text-success bg-success/10';
      case 'sell':
        return 'text-error bg-error/10';
      default:
        return 'text-warning bg-warning/10';
    }
  };

  return (
    <div className="card-mobile">
      <div className="flex-mobile-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-responsive-h2 font-semibold text-foreground mb-1">Market Screener</h2>
          <p className="text-sm text-muted-foreground">Filter and analyze cryptocurrency performance</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Icon name="Search" size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coins..."
            className="input-mobile flex-1 sm:flex-none" />
        </div>
      </div>
      
      <div className="tabs-mobile mb-6">
        {filters?.map((filter) =>
        <button
          key={filter?.id}
          onClick={() => setSelectedFilter(filter?.id)}
          className={`tab-mobile ${
          selectedFilter === filter?.id ?
          'bg-primary text-primary-foreground' :
          'bg-muted text-muted-foreground hover:bg-card hover:text-foreground active:scale-95'}`
          }>
            <Icon name={filter?.icon} size={16} />
            {filter?.label}
          </button>
        )}
      </div>
      
      <div className="table-mobile-wrapper">
        <table className="table-mobile">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 sm:px-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation">
                  Coin
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2 sm:px-4">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto touch-manipulation">
                  Price
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2 sm:px-4">
                <button
                  onClick={() => handleSort('change24h')}
                  className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto touch-manipulation">
                  24h
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2 sm:px-4 hidden md:table-cell">
                <button
                  onClick={() => handleSort('volume24h')}
                  className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto touch-manipulation">
                  Volume
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-right py-3 px-2 sm:px-4 hidden lg:table-cell">
                <button
                  onClick={() => handleSort('marketCap')}
                  className="flex items-center justify-end gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto touch-manipulation">
                  Market Cap
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-center py-3 px-2 sm:px-4">
                <span className="text-xs sm:text-sm text-muted-foreground">Signal</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cryptocurrencies?.map((crypto) =>
            <tr
              key={crypto?.id}
              className="border-b border-border hover:bg-muted transition-colors cursor-pointer active:bg-muted/70">
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                      src={crypto?.image}
                      alt={crypto?.imageAlt}
                      className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">
                        {crypto?.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground truncate hidden sm:block">{crypto?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 sm:px-4 text-right">
                  <p className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                    ₺{crypto?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </td>
                <td className="py-3 px-2 sm:px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Icon
                    name={crypto?.change24h >= 0 ? 'TrendingUp' : 'TrendingDown'}
                    size={12}
                    className={crypto?.change24h >= 0 ? 'text-success' : 'text-error'} />
                    <span
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                    crypto?.change24h >= 0 ? 'text-success' : 'text-error'}`
                    }>
                      {Math.abs(crypto?.change24h)}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 sm:px-4 text-right hidden md:table-cell">
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    ${(crypto?.volume24h / 1000000)?.toFixed(1)}M
                  </p>
                </td>
                <td className="py-3 px-2 sm:px-4 text-right hidden lg:table-cell">
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    ${(crypto?.marketCap / 1000000000)?.toFixed(1)}B
                  </p>
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex justify-center">
                    <span
                    className={`px-2 py-1 rounded text-xs font-medium uppercase whitespace-nowrap ${
                    getSignalColor(crypto?.signal)}`
                    }>
                      {crypto?.signal}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

};

export default MarketScreener;