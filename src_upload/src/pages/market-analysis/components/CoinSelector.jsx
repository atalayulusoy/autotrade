import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const CoinSelector = ({ onCoinSelect, selectedCoin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const availableCoins = [
    { symbol: 'BTC', name: 'Bitcoin', icon: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Coins' },
    { symbol: 'BNB', name: 'Binance Coin', icon: 'Coins' },
    { symbol: 'XRP', name: 'Ripple', icon: 'Coins' },
    { symbol: 'ADA', name: 'Cardano', icon: 'Coins' },
    { symbol: 'SOL', name: 'Solana', icon: 'Coins' },
    { symbol: 'DOGE', name: 'Dogecoin', icon: 'Coins' },
    { symbol: 'DOT', name: 'Polkadot', icon: 'Coins' },
    { symbol: 'MATIC', name: 'Polygon', icon: 'Coins' },
    { symbol: 'AVAX', name: 'Avalanche', icon: 'Coins' },
    { symbol: 'LINK', name: 'Chainlink', icon: 'Coins' },
    { symbol: 'UNI', name: 'Uniswap', icon: 'Coins' },
    { symbol: 'LTC', name: 'Litecoin', icon: 'Coins' },
    { symbol: 'ATOM', name: 'Cosmos', icon: 'Coins' },
    { symbol: 'XLM', name: 'Stellar', icon: 'Coins' }
  ];

  useEffect(() => {
    const filtered = availableCoins?.filter(
      (coin) =>
        coin?.symbol?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        coin?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
    setFilteredCoins(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCoinSelect = (coin) => {
    onCoinSelect(coin);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon name="Search" size={20} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            onFocus={handleInputFocus}
            placeholder="Coin ara (örn: BTC, Ethereum)..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {selectedCoin && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
            <Icon name={selectedCoin?.icon} size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {selectedCoin?.symbol}
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedCoin?.name}
            </span>
          </div>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-lg bg-card border border-border shadow-lg z-50">
          {filteredCoins?.length > 0 ? (
            <div className="p-2">
              {filteredCoins?.map((coin) => (
                <button
                  key={coin?.symbol}
                  onClick={() => handleCoinSelect(coin)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Icon name={coin?.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {coin?.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {coin?.name}
                    </div>
                  </div>
                  {selectedCoin?.symbol === coin?.symbol && (
                    <Icon name="Check" size={18} className="text-success" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Coin bulunamadı
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoinSelector;