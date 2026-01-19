import React, { useState } from 'react';

import Icon from './AppIcon';
import { sendPushNotification } from '../utils/pushNotifications';

const QuickTradePanel = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTC/USDT');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('market');

  const quickCoins = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'];

  const handleQuickBuy = () => {
    sendPushNotification('Order Placed', {
      body: `Buy order for ${amount} ${selectedCoin}`,
      tag: 'quick-trade'
    });
  };

  const handleQuickSell = () => {
    sendPushNotification('Order Placed', {
      body: `Sell order for ${amount} ${selectedCoin}`,
      tag: 'quick-trade'
    });
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 z-300">
      <div className="card-mobile w-80 max-w-[calc(100vw-2rem)] shadow-elevation-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Trade</h3>
          <Icon name="Zap" size={20} color="#2563eb" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Coin
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickCoins?.map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-touch ${
                    selectedCoin === coin
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-card'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Amount (USDT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e?.target?.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType('market')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-touch ${
                  orderType === 'market' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-card'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-touch ${
                  orderType === 'limit' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-card'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleQuickBuy}
              className="btn-touch px-4 py-3 rounded-lg bg-success text-white font-medium hover:bg-success/90"
            >
              Buy
            </button>
            <button
              onClick={handleQuickSell}
              className="btn-touch px-4 py-3 rounded-lg bg-error text-white font-medium hover:bg-error/90"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTradePanel;