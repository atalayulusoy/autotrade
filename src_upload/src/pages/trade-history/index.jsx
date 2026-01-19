import React, { useState, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import TradeFilters from './components/TradeFilters';
import SummaryCards from './components/SummaryCards';
import TradeTable from './components/TradeTable';
import Pagination from './components/Pagination';

const TradeHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filters, setFilters] = useState({
    startDate: '2026-01-01',
    endDate: '2026-01-14',
    exchange: 'all',
    tradingPair: 'all',
    tradeType: 'all',
    minProfit: '',
    maxProfit: '',
    searchId: ''
  });

  const allTrades = [
    {
      id: 'TRD-2026-001234',
      timestamp: '14/01/2026 16:45:23',
      pair: 'BTC/TRY',
      type: 'buy',
      amount: 0.05234567,
      price: 2845678.50,
      total: 148956.32,
      fee: 372.39,
      profitLoss: 4567.89,
      exchange: 'Binance',
      signalSource: 'TradingView - RSI Oversold',
      signalTime: '14/01/2026 16:44:58',
      executionDelay: '25 saniye',
      orderBook: {
        bestBid: 2845650.00,
        bestAsk: 2845700.00,
        spread: 0.0018
      }
    },
    {
      id: 'TRD-2026-001233',
      timestamp: '14/01/2026 15:32:11',
      pair: 'ETH/TRY',
      type: 'sell',
      amount: 1.23456789,
      price: 98765.43,
      total: 121923.45,
      fee: 304.81,
      profitLoss: -2345.67,
      exchange: 'OKX',
      signalSource: 'TradingView - MACD Bearish Cross',
      signalTime: '14/01/2026 15:31:45',
      executionDelay: '26 saniye',
      orderBook: {
        bestBid: 98760.00,
        bestAsk: 98770.00,
        spread: 0.0101
      }
    },
    {
      id: 'TRD-2026-001232',
      timestamp: '14/01/2026 14:18:45',
      pair: 'XRP/TRY',
      type: 'buy',
      amount: 5678.90123456,
      price: 23.45,
      total: 133190.24,
      fee: 332.98,
      profitLoss: 1234.56,
      exchange: 'BTCTURK',
      signalSource: 'TradingView - Bollinger Bounce',
      signalTime: '14/01/2026 14:18:12',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 23.44,
        bestAsk: 23.46,
        spread: 0.0853
      }
    },
    {
      id: 'TRD-2026-001231',
      timestamp: '14/01/2026 13:05:33',
      pair: 'ADA/TRY',
      type: 'sell',
      amount: 12345.67890123,
      price: 12.34,
      total: 152345.68,
      fee: 380.86,
      profitLoss: 3456.78,
      exchange: 'Bybit',
      signalSource: 'TradingView - EMA Cross Down',
      signalTime: '14/01/2026 13:05:01',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 12.33,
        bestAsk: 12.35,
        spread: 0.1622
      }
    },
    {
      id: 'TRD-2026-001230',
      timestamp: '14/01/2026 11:42:19',
      pair: 'SOL/TRY',
      type: 'buy',
      amount: 45.67890123,
      price: 3456.78,
      total: 157890.12,
      fee: 394.73,
      profitLoss: -1234.56,
      exchange: 'Gate.io',
      signalSource: 'TradingView - Support Level Bounce',
      signalTime: '14/01/2026 11:41:52',
      executionDelay: '27 saniye',
      orderBook: {
        bestBid: 3456.50,
        bestAsk: 3457.00,
        spread: 0.0145
      }
    },
    {
      id: 'TRD-2026-001229',
      timestamp: '14/01/2026 10:28:07',
      pair: 'AVAX/TRY',
      type: 'sell',
      amount: 234.56789012,
      price: 567.89,
      total: 133234.56,
      fee: 333.09,
      profitLoss: 2345.67,
      exchange: 'Binance',
      signalSource: 'TradingView - Resistance Rejection',
      signalTime: '14/01/2026 10:27:38',
      executionDelay: '29 saniye',
      orderBook: {
        bestBid: 567.85,
        bestAsk: 567.93,
        spread: 0.0141
      }
    },
    {
      id: 'TRD-2026-001228',
      timestamp: '14/01/2026 09:15:54',
      pair: 'DOGE/TRY',
      type: 'buy',
      amount: 98765.43210987,
      price: 2.34,
      total: 231111.11,
      fee: 577.78,
      profitLoss: 4567.89,
      exchange: 'OKX',
      signalSource: 'TradingView - Volume Spike',
      signalTime: '14/01/2026 09:15:21',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 2.33,
        bestAsk: 2.35,
        spread: 0.8547
      }
    },
    {
      id: 'TRD-2026-001227',
      timestamp: '14/01/2026 08:03:42',
      pair: 'MATIC/TRY',
      type: 'sell',
      amount: 3456.78901234,
      price: 34.56,
      total: 119456.78,
      fee: 298.64,
      profitLoss: -3456.78,
      exchange: 'BTCTURK',
      signalSource: 'TradingView - Stochastic Overbought',
      signalTime: '14/01/2026 08:03:09',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 34.54,
        bestAsk: 34.58,
        spread: 0.1158
      }
    },
    {
      id: 'TRD-2026-001226',
      timestamp: '13/01/2026 23:51:30',
      pair: 'BTC/TRY',
      type: 'buy',
      amount: 0.03456789,
      price: 2834567.89,
      total: 97956.78,
      fee: 244.89,
      profitLoss: 1234.56,
      exchange: 'Bybit',
      signalSource: 'TradingView - Golden Cross',
      signalTime: '13/01/2026 23:50:58',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 2834550.00,
        bestAsk: 2834600.00,
        spread: 0.0018
      }
    },
    {
      id: 'TRD-2026-001225',
      timestamp: '13/01/2026 22:38:18',
      pair: 'ETH/TRY',
      type: 'sell',
      amount: 0.98765432,
      price: 98234.56,
      total: 97023.45,
      fee: 242.56,
      profitLoss: 2345.67,
      exchange: 'Gate.io',
      signalSource: 'TradingView - Death Cross',
      signalTime: '13/01/2026 22:37:45',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 98230.00,
        bestAsk: 98240.00,
        spread: 0.0102
      }
    },
    {
      id: 'TRD-2026-001224',
      timestamp: '13/01/2026 21:25:06',
      pair: 'XRP/TRY',
      type: 'buy',
      amount: 4567.89012345,
      price: 23.12,
      total: 105608.90,
      fee: 264.02,
      profitLoss: -1234.56,
      exchange: 'Binance',
      signalSource: 'TradingView - Fibonacci Retracement',
      signalTime: '13/01/2026 21:24:34',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 23.11,
        bestAsk: 23.13,
        spread: 0.0865
      }
    },
    {
      id: 'TRD-2026-001223',
      timestamp: '13/01/2026 20:11:54',
      pair: 'ADA/TRY',
      type: 'sell',
      amount: 11234.56789012,
      price: 12.23,
      total: 137400.12,
      fee: 343.50,
      profitLoss: 3456.78,
      exchange: 'OKX',
      signalSource: 'TradingView - Ichimoku Cloud Break',
      signalTime: '13/01/2026 20:11:21',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 12.22,
        bestAsk: 12.24,
        spread: 0.1636
      }
    },
    {
      id: 'TRD-2026-001222',
      timestamp: '13/01/2026 18:58:42',
      pair: 'SOL/TRY',
      type: 'buy',
      amount: 43.21098765,
      price: 3423.45,
      total: 147923.45,
      fee: 369.81,
      profitLoss: 4567.89,
      exchange: 'BTCTURK',
      signalSource: 'TradingView - Parabolic SAR Flip',
      signalTime: '13/01/2026 18:58:09',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 3423.20,
        bestAsk: 3423.70,
        spread: 0.0146
      }
    },
    {
      id: 'TRD-2026-001221',
      timestamp: '13/01/2026 17:45:30',
      pair: 'AVAX/TRY',
      type: 'sell',
      amount: 223.45678901,
      price: 556.78,
      total: 124423.45,
      fee: 311.06,
      profitLoss: -2345.67,
      exchange: 'Bybit',
      signalSource: 'TradingView - ADX Trend Reversal',
      signalTime: '13/01/2026 17:44:58',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 556.74,
        bestAsk: 556.82,
        spread: 0.0144
      }
    },
    {
      id: 'TRD-2026-001220',
      timestamp: '13/01/2026 16:32:18',
      pair: 'DOGE/TRY',
      type: 'buy',
      amount: 87654.32109876,
      price: 2.31,
      total: 202481.48,
      fee: 506.20,
      profitLoss: 1234.56,
      exchange: 'Gate.io',
      signalSource: 'TradingView - Williams %R Oversold',
      signalTime: '13/01/2026 16:31:45',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 2.30,
        bestAsk: 2.32,
        spread: 0.8658
      }
    },
    {
      id: 'TRD-2026-001219',
      timestamp: '13/01/2026 15:19:06',
      pair: 'MATIC/TRY',
      type: 'sell',
      amount: 3234.56789012,
      price: 34.12,
      total: 110345.67,
      fee: 275.86,
      profitLoss: 2345.67,
      exchange: 'Binance',
      signalSource: 'TradingView - CCI Overbought',
      signalTime: '13/01/2026 15:18:34',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 34.10,
        bestAsk: 34.14,
        spread: 0.1172
      }
    },
    {
      id: 'TRD-2026-001218',
      timestamp: '13/01/2026 14:05:54',
      pair: 'BTC/TRY',
      type: 'buy',
      amount: 0.04567890,
      price: 2823456.78,
      total: 128956.78,
      fee: 322.39,
      profitLoss: -3456.78,
      exchange: 'OKX',
      signalSource: 'TradingView - Keltner Channel Breakout',
      signalTime: '13/01/2026 14:05:21',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 2823440.00,
        bestAsk: 2823490.00,
        spread: 0.0018
      }
    },
    {
      id: 'TRD-2026-001217',
      timestamp: '13/01/2026 12:52:42',
      pair: 'ETH/TRY',
      type: 'sell',
      amount: 1.12345678,
      price: 97890.12,
      total: 109956.78,
      fee: 274.89,
      profitLoss: 4567.89,
      exchange: 'BTCTURK',
      signalSource: 'TradingView - Donchian Channel Exit',
      signalTime: '13/01/2026 12:52:09',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 97885.00,
        bestAsk: 97895.00,
        spread: 0.0102
      }
    },
    {
      id: 'TRD-2026-001216',
      timestamp: '13/01/2026 11:39:30',
      pair: 'XRP/TRY',
      type: 'buy',
      amount: 5234.56789012,
      price: 22.89,
      total: 119823.45,
      fee: 299.56,
      profitLoss: 1234.56,
      exchange: 'Bybit',
      signalSource: 'TradingView - Aroon Indicator Bullish',
      signalTime: '13/01/2026 11:38:58',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 22.88,
        bestAsk: 22.90,
        spread: 0.0873
      }
    },
    {
      id: 'TRD-2026-001215',
      timestamp: '13/01/2026 10:26:18',
      pair: 'ADA/TRY',
      type: 'sell',
      amount: 10987.65432109,
      price: 12.12,
      total: 133167.89,
      fee: 332.92,
      profitLoss: -2345.67,
      exchange: 'Gate.io',
      signalSource: 'TradingView - Chaikin Money Flow Bearish',
      signalTime: '13/01/2026 10:25:45',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 12.11,
        bestAsk: 12.13,
        spread: 0.1651
      }
    },
    {
      id: 'TRD-2026-001214',
      timestamp: '13/01/2026 09:13:06',
      pair: 'SOL/TRY',
      type: 'buy',
      amount: 41.23456789,
      price: 3389.12,
      total: 139756.78,
      fee: 349.39,
      profitLoss: 3456.78,
      exchange: 'Binance',
      signalSource: 'TradingView - On Balance Volume Surge',
      signalTime: '13/01/2026 09:12:34',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 3389.00,
        bestAsk: 3389.50,
        spread: 0.0148
      }
    },
    {
      id: 'TRD-2026-001213',
      timestamp: '13/01/2026 07:59:54',
      pair: 'AVAX/TRY',
      type: 'sell',
      amount: 212.34567890,
      price: 545.67,
      total: 115856.78,
      fee: 289.64,
      profitLoss: 4567.89,
      exchange: 'OKX',
      signalSource: 'TradingView - Money Flow Index Overbought',
      signalTime: '13/01/2026 07:59:21',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 545.63,
        bestAsk: 545.71,
        spread: 0.0147
      }
    },
    {
      id: 'TRD-2026-001212',
      timestamp: '13/01/2026 06:46:42',
      pair: 'DOGE/TRY',
      type: 'buy',
      amount: 76543.21098765,
      price: 2.28,
      total: 174518.52,
      fee: 436.30,
      profitLoss: -1234.56,
      exchange: 'BTCTURK',
      signalSource: 'TradingView - Rate of Change Positive',
      signalTime: '13/01/2026 06:46:09',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 2.27,
        bestAsk: 2.29,
        spread: 0.8772
      }
    },
    {
      id: 'TRD-2026-001211',
      timestamp: '13/01/2026 05:33:30',
      pair: 'MATIC/TRY',
      type: 'sell',
      amount: 3012.34567890,
      price: 33.89,
      total: 102108.11,
      fee: 255.27,
      profitLoss: 2345.67,
      exchange: 'Bybit',
      signalSource: 'TradingView - Commodity Channel Index Exit',
      signalTime: '13/01/2026 05:32:58',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 33.87,
        bestAsk: 33.91,
        spread: 0.1181
      }
    },
    {
      id: 'TRD-2026-001210',
      timestamp: '13/01/2026 04:20:18',
      pair: 'BTC/TRY',
      type: 'buy',
      amount: 0.05678901,
      price: 2812345.67,
      total: 159723.45,
      fee: 399.31,
      profitLoss: 1234.56,
      exchange: 'Gate.io',
      signalSource: 'TradingView - Ultimate Oscillator Bullish',
      signalTime: '13/01/2026 04:19:45',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 2812330.00,
        bestAsk: 2812380.00,
        spread: 0.0018
      }
    },
    {
      id: 'TRD-2026-001209',
      timestamp: '13/01/2026 03:07:06',
      pair: 'ETH/TRY',
      type: 'sell',
      amount: 1.34567890,
      price: 97456.78,
      total: 131156.78,
      fee: 327.89,
      profitLoss: -3456.78,
      exchange: 'Binance',
      signalSource: 'TradingView - Awesome Oscillator Bearish',
      signalTime: '13/01/2026 03:06:34',
      executionDelay: '32 saniye',
      orderBook: {
        bestBid: 97450.00,
        bestAsk: 97460.00,
        spread: 0.0103
      }
    },
    {
      id: 'TRD-2026-001208',
      timestamp: '13/01/2026 01:53:54',
      pair: 'XRP/TRY',
      type: 'buy',
      amount: 5901.23456789,
      price: 22.67,
      total: 133789.01,
      fee: 334.47,
      profitLoss: 4567.89,
      exchange: 'OKX',
      signalSource: 'TradingView - Elder Ray Bull Power',
      signalTime: '13/01/2026 01:53:21',
      executionDelay: '33 saniye',
      orderBook: {
        bestBid: 22.66,
        bestAsk: 22.68,
        spread: 0.0882
      }
    }
  ];

  const filteredTrades = useMemo(() => {
    return allTrades?.filter((trade) => {
      const tradeDate = new Date(trade.timestamp.split(' ')[0].split('/').reverse().join('-'));
      const startDate = filters?.startDate ? new Date(filters.startDate) : null;
      const endDate = filters?.endDate ? new Date(filters.endDate) : null;

      if (startDate && tradeDate < startDate) return false;
      if (endDate && tradeDate > endDate) return false;
      if (filters?.exchange !== 'all' && trade?.exchange?.toLowerCase() !== filters?.exchange) return false;
      if (filters?.tradingPair !== 'all' && trade?.pair !== filters?.tradingPair) return false;
      if (filters?.tradeType !== 'all' && trade?.type !== filters?.tradeType) return false;
      if (filters?.minProfit && trade?.profitLoss < Number(filters?.minProfit)) return false;
      if (filters?.maxProfit && trade?.profitLoss > Number(filters?.maxProfit)) return false;
      if (filters?.searchId && !trade?.id?.toLowerCase()?.includes(filters?.searchId?.toLowerCase())) return false;

      return true;
    });
  }, [filters]);

  const summary = useMemo(() => {
    const totalTrades = filteredTrades?.length;
    const successfulTrades = filteredTrades?.filter(t => t?.profitLoss > 0)?.length;
    const totalProfitLoss = filteredTrades?.reduce((sum, t) => sum + t?.profitLoss, 0);
    const totalVolume = filteredTrades?.reduce((sum, t) => sum + t?.total, 0);

    return {
      totalTrades,
      successRate: totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0,
      totalProfitLoss,
      avgVolume: totalTrades > 0 ? totalVolume / totalTrades : 0
    };
  }, [filteredTrades]);

  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTrades?.slice(startIndex, endIndex);
  }, [filteredTrades, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTrades?.length / itemsPerPage);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '2026-01-01',
      endDate: '2026-01-14',
      exchange: 'all',
      tradingPair: 'all',
      tradeType: 'all',
      minProfit: '',
      maxProfit: '',
      searchId: ''
    });
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ['Tarih & Saat', 'İşlem ID', 'Parite', 'Tip', 'Miktar', 'Fiyat', 'Toplam', 'Komisyon', 'Net Kar/Zarar', 'Borsa'];
    const csvContent = [
      headers?.join(';'),
      ...filteredTrades?.map(trade => [
        trade?.timestamp,
        trade?.id,
        trade?.pair,
        trade?.type === 'buy' ? 'Alış' : 'Satış',
        trade?.amount?.toLocaleString('tr-TR', { minimumFractionDigits: 8, maximumFractionDigits: 8 }),
        trade?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        trade?.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        trade?.fee?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        trade?.profitLoss?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        trade?.exchange
      ]?.join(';'))
    ]?.join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', `islem_gecmisi_${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            İşlem Geçmişi
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Otomatik trading bot işlemlerinizi takip edin ve analiz edin
          </p>
        </div>

        <SummaryCards summary={summary} />

        <TradeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onExport={handleExport}
        />

        <TradeTable trades={paginatedTrades} onRowExpand={() => {}} />

        {filteredTrades?.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTrades?.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default TradeHistory;