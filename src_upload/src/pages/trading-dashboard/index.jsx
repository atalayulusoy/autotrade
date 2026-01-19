import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { User, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { tradingSignalService } from '../../services/tradingSignalService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { apiUrl } from '../../services/apiBase';
import AccountModeToggle from './components/AccountModeToggle';
import TradingControlPanel from './components/TradingControlPanel';
import ExchangeStatusBar from './components/ExchangeStatusBar';
import CandlestickChart from './components/CandlestickChart';
import CoinListPanel from './components/CoinListPanel';
import SignalCard from './components/SignalCard';
import SignalHistory from './components/SignalHistory';
// import AIAnalysisPanel from './components/AIAnalysisPanel';
import AutoTradingPanel from './components/AutoTradingPanel';
import ManualTradingPanel from './components/ManualTradingPanel';

const TradingDashboard = () => {
  const { userProfile } = useAuth();

  const [autoMode, setAutoMode] = useState('NORMAL');
  const [gateStatus, setGateStatus] = useState(true);
  const [systemStatus, setSystemStatus] = useState(true);

  const [testMode, setTestMode] = useState('TEST');
  const [testBalance, setTestBalance] = useState(0);

  const [realBalances, setRealBalances] = useState([]);
  const [balance, setBalance] = useState(0);

  const [commission, setCommission] = useState(0.05);

  const [selectedExchange, setSelectedExchange] = useState('OKX');
  const [selectedCoin, setSelectedCoin] = useState('BTC/USDT');
  const [pendingAutoTrades, setPendingAutoTrades] = useState([]);
  const [activeCoins, setActiveCoins] = useState([]);
  const [coinOptions, setCoinOptions] = useState([]);
  const [tickerSnapshot, setTickerSnapshot] = useState({ usdtTry: 0, prices: {} });
  const [usdtAmount, setUsdtAmount] = useState('Örn. 20');

  const [manualExchange, setManualExchange] = useState('OKX');
  const [manualCoin, setManualCoin] = useState('1INCH/USDT');
  const [manualUsdt, setManualUsdt] = useState('10.00');
  const [tradeType, setTradeType] = useState('BUY');

  const [pendingSignals, setPendingSignals] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);

  const [signalsLoading, setSignalsLoading] = useState(false);
  const [processingSignalId, setProcessingSignalId] = useState(null);

  // Chart controls
  const [timeframe, setTimeframe] = useState('1H');
  const [indicators, setIndicators] = useState(['MA']);

  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];
  const availableIndicators = [
    { id: 'MA', name: 'Hareketli Ortalama', color: '#4a9eff' },
    { id: 'RSI', name: 'RSI', color: '#00d4ff' },
    { id: 'MACD', name: 'MACD', color: '#00c851' },
    { id: 'BB', name: 'Bollinger Bantları', color: '#ff8f00' }
  ];

  const toggleIndicator = (indicatorId) => {
    setIndicators((prev) =>
      prev?.includes(indicatorId)
        ? prev?.filter((id) => id !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  const loadSignalsAndPositions = async () => {
    setSignalsLoading(true);

    const { data: signals } = await tradingSignalService?.getPendingSignals();
    setPendingSignals(signals || []);

    const { data: positions } = await tradingSignalService?.monitorPositions();
    setOpenPositions(positions || []);

    setSignalsLoading(false);
  };

  const loadBalances = async () => {
    try {
      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('balance')
        ?.eq('id', userProfile?.id)
        ?.single();

      if (profile) {
        setTestBalance(profile?.balance || 1000);
      }

      const { data: apiKeys } = await supabase
        ?.from('exchange_api_keys')
        ?.select('exchange, api_key, is_active')
        ?.eq('user_id', userProfile?.id)
        ?.eq('is_active', true);

      if (apiKeys && apiKeys?.length > 0) {
        const exchangeBalances = apiKeys?.map((key) => ({
          name: key?.exchange,
          balance: Math.random() * 100
        }));
        setRealBalances(exchangeBalances);
      }
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  // Load user balances when profile ready
  useEffect(() => {
    if (userProfile?.id) {
      loadBalances();
    }
  }, [userProfile]);

  // Update displayed balance when mode changes
  useEffect(() => {
    if (testMode === 'TEST') {
      setBalance(testBalance);
    } else {
      const totalReal = realBalances?.reduce((sum, ex) => sum + (ex?.balance || 0), 0);
      setBalance(totalReal);
    }
  }, [testMode, testBalance, realBalances]);

  const handleModeChange = (newMode) => {
    setTestMode(newMode);
    if (newMode === 'REAL' && realBalances?.length === 0) {
      alert('Gerçek mod için önce borsa API anahtarlarınızı eklemelisiniz.');
    }
  };

  const handleCoinSelect = (coin) => {
    if (!coin) return;
    if (typeof coin === 'string') {
      setSelectedCoin(coin);
      return;
    }
    const symbol = coin?.symbol ? `${coin?.symbol}/USDT` : coin?.pair || 'BTC/USDT';
    setSelectedCoin(symbol);
  };

  // Initial load + realtime subscribe
  useEffect(() => {
    loadSignalsAndPositions();

    const subscription = tradingSignalService?.subscribeToSignals((payload) => {
      console.log('Signal update:', payload);
      loadSignalsAndPositions();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadCoins = async () => {
      try {
        const res = await fetch(apiUrl('/api/public/coins'));
        const data = await res.json();
        const list = Array.isArray(data?.coins) ? data.coins : Array.isArray(data) ? data : [];
        if (!alive) return;
        const symbols = list
          .map((c) => (typeof c === 'string' ? c : c?.symbol))
          .filter(Boolean);
        setCoinOptions(symbols);
      } catch (error) {
        if (alive) {
          setCoinOptions(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT']);
        }
      }
    };
    loadCoins();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (coinOptions?.length && !coinOptions.includes(selectedCoin)) {
      setSelectedCoin(coinOptions[0]);
    }
  }, [coinOptions, selectedCoin]);

  useEffect(() => {
    if (!activeCoins?.length && !openPositions?.length) return;
    let alive = true;

    const fetchTicker = async () => {
      const symbols = Array.from(
        new Set(
          [...(activeCoins || []), ...(openPositions || [])]
            .map((c) => c?.symbol)
            .filter(Boolean)
        )
      );

      if (!symbols.length) return;
      try {
        const res = await fetch(
          apiUrl(`/api/public/ticker?symbols=${encodeURIComponent(symbols.join(','))}`)
        );
        const data = await res.json();
        if (!alive) return;
        setTickerSnapshot({
          usdtTry: Number(data?.usdt_try || 0),
          prices: data?.prices || {}
        });
      } catch (error) {
        if (alive) {
          setTickerSnapshot((prev) => ({ ...prev }));
        }
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 2000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [activeCoins, openPositions]);

  // DEMO bakiye event ile aninda dusur + pozisyon yenile
  useEffect(() => {
    const onSpent = (e) => {
      const spent = Number(e?.detail?.spent) || 0;
      if (spent > 0) {
        setTestBalance((prev) => Math.max(0, (Number(prev) || 0) - spent));
      }
    };

    const onRefresh = () => {
      loadSignalsAndPositions();
    };

    window.addEventListener('au_demo_balance_spent', onSpent);
    window.addEventListener('au_positions_refresh', onRefresh);

    return () => {
      window.removeEventListener('au_demo_balance_spent', onSpent);
      window.removeEventListener('au_positions_refresh', onRefresh);
    };
  }, []);

  // Handler functions
  const handleManualTrade = async (trade) => {
    // trade: { side, symbol, amountUsdt, price }
    if (!trade || !trade.symbol) {
      console.log('Manual trade executed');
      return;
    }

    const side = String(trade.side || 'BUY').toUpperCase();
    if (side === 'BUY') {
      upsertActiveCoin({
        symbol: trade.symbol,
        side: 'LONG',
        amount_usdt: Number(trade.amountUsdt || 0) || 0,
        entry_price: Number(trade.price || 0) || 0,
        source: 'manual',
        created_at: new Date().toISOString(),
      });
    }
    if (side === 'SELL') {
      setActiveCoins((prev) => (prev || []).filter((p) => p?.symbol !== trade.symbol));
    }

    console.log('Manual trade executed', trade);
  };

  const handleExecuteSignal = async (signalId, amountUsdt) => {
    await handleProcessSignal(signalId, amountUsdt);
  };

  const handleRejectSignal = async (signalId) => {
    setProcessingSignalId(signalId);
    const { error } = await tradingSignalService?.rejectSignal(signalId);
    if (error) {
      alert('❌ Signal rejection failed: ' + error?.message);
    } else {
      alert('✅ Signal rejected successfully!');
      loadSignalsAndPositions();
    }
    setProcessingSignalId(null);
  };

  const handleClosePosition = async (positionId) => {
    setProcessingSignalId(positionId);
    const { error } = await tradingSignalService?.closePosition(positionId);
    if (error) {
      alert('❌ Position close failed: ' + error?.message);
    } else {
      alert('✅ Position closed successfully!');
      loadSignalsAndPositions();
    }
    setProcessingSignalId(null);
  };

  const handleProcessSignal = async (signalId, amountUsdt) => {
    setProcessingSignalId(signalId);
    const { error, riskBlocked, sentimentFiltered } = await tradingSignalService?.processSignal(signalId, amountUsdt);

    if (error) {
      if (riskBlocked) {
        alert('⚠️ Risk Limiti Aşıldı: ' + error?.message);
      } else if (sentimentFiltered) {
        alert('📉 Piyasa Duyarlılığı Uyarısı: ' + error?.message);
      } else {
        alert('❌ İşlem başarısız: ' + error?.message);
      }
    } else {
      alert('✅ İşlem başarıyla oluşturuldu!');
      loadSignalsAndPositions();
    }

    setProcessingSignalId(null);
  };

  // Kontrol panelinde görünecek aktif coinler
  const activeCoinsForControlPanel = useMemo(() => {
    // Önce UI tarafında eklenenleri göster, yoksa DB'den gelenleri göster
    if (activeCoins?.length) return activeCoins;
    return openPositions || [];
  }, [activeCoins, openPositions]);

  const activeCoinsWithPnL = useMemo(() => {
    const usdtTry = Number(tickerSnapshot?.usdtTry || 0);
    const prices = tickerSnapshot?.prices || {};

    return (activeCoinsForControlPanel || []).map((coin) => {
      const symbol = coin?.symbol;
      const entryPrice = Number(
        coin?.entry_price ?? coin?.entryPrice ?? coin?.price ?? coin?.entryPrice
      ) || 0;
      const currentPrice = Number(coin?.currentPrice ?? prices?.[symbol] ?? entryPrice) || 0;
      const quantity = Number(coin?.quantity ?? coin?.qty ?? 0) || 0;
      const amountUsdt = Number(coin?.amount_usdt ?? coin?.amountUsdt ?? coin?.usdt ?? 0) || 0;

      const effectiveQty = quantity || (entryPrice > 0 ? amountUsdt / entryPrice : 0);
      const pnlUsdt = entryPrice > 0 ? (currentPrice - entryPrice) * effectiveQty : 0;
      const pnlTry = usdtTry ? pnlUsdt * usdtTry : 0;

      return {
        ...coin,
        symbol,
        entry_price: entryPrice || coin?.entry_price,
        currentPrice,
        pnlUsdt,
        pnlTry,
        usdtTry,
      };
    });
  }, [activeCoinsForControlPanel, tickerSnapshot]);

  const chartSymbol = useMemo(() => {
    const v = selectedCoin;
    if (!v) return 'BTC/USDT';
    if (typeof v === 'string') {
      // UI default placeholder gelirse BTC/USDT'e düş
      return v.includes('/') ? v : 'BTC/USDT';
    }
    return v?.symbol || v?.pair || 'BTC/USDT';
  }, [selectedCoin]);

  const addPendingAutoTrade = (trade) => {
    if (!trade) return;
    setPendingAutoTrades((prev) => [trade, ...(prev || [])]);
  };

  const removePendingAutoTrade = (id) => {
    setPendingAutoTrades((prev) => (prev || []).filter((t) => t?.id !== id));
  };

  const updatePendingAutoTrade = (id, patch) => {
    setPendingAutoTrades((prev) => (prev || []).map((t) => (t?.id === id ? { ...t, ...patch } : t)));
  };

  const upsertActiveCoin = (coin) => {
    if (!coin?.symbol) return;
    setActiveCoins((prev) => {
      const list = prev || [];
      const idx = list.findIndex((x) => x?.symbol === coin.symbol);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = { ...copy[idx], ...coin };
        return copy;
      }
      return [coin, ...list];
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Trading Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Otomatik ve manuel işlem yönetimi
              </p>
            </div>
            <div className="flex gap-4">
              <AccountModeToggle
                mode={testMode}
                onModeChange={handleModeChange}
                testBalance={testBalance}
                realBalances={realBalances}
              />
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <User size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {testMode === 'TEST' ? `${testBalance?.toFixed(2)} USDT` : `${balance?.toFixed(2)} USDT`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Status Bar */}
        <ExchangeStatusBar />

        {/* Auto + Manual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Otomatik İşlem
            </h2>
            <AutoTradingPanel
              selectedExchange={selectedExchange}
              setSelectedExchange={setSelectedExchange}
              selectedCoin={selectedCoin}
              setSelectedCoin={setSelectedCoin}
              coins={coinOptions}
              usdtAmount={usdtAmount}
              setUsdtAmount={setUsdtAmount}
              commission={commission}
              testMode={testMode}
              balance={balance}
              pendingAutoTrades={pendingAutoTrades}
              setPendingAutoTrades={setPendingAutoTrades}
              onActiveCoinUpsert={upsertActiveCoin}
            />
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Manuel İşlem
            </h2>
            <ManualTradingPanel
              manualExchange={manualExchange}
              setManualExchange={setManualExchange}
              manualCoin={manualCoin}
              setManualCoin={setManualCoin}
              manualUsdt={manualUsdt}
              setManualUsdt={setManualUsdt}
              tradeType={tradeType}
              setTradeType={setTradeType}
              onExecute={handleManualTrade}
              testMode={testMode}
              balance={balance}
              onBalanceUpdate={loadBalances}
              onActiveCoinUpsert={upsertActiveCoin}
            />
          </div>
        </div>

        {/* Trading Controls */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Otomatik İşlem Kontrolleri
            </h2>

            <button
              className="text-xs text-primary hover:underline"
              onClick={loadSignalsAndPositions}
              disabled={signalsLoading}
            >
              {signalsLoading ? 'Yükleniyor' : 'Yenile'}
            </button>
          </div>

          <TradingControlPanel
            autoMode={autoMode}
            setAutoMode={setAutoMode}
            gateStatus={gateStatus}
            setGateStatus={setGateStatus}
            systemStatus={systemStatus}
            setSystemStatus={setSystemStatus}
            selectedCoin={selectedCoin}
            pendingAutoTrades={pendingAutoTrades}
            setPendingAutoTrades={setPendingAutoTrades}
            activeCoins={activeCoinsWithPnL}
            setActiveCoins={setActiveCoins}
          />
        </div>

        {/* Pending Signals */}
        {pendingSignals?.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-warning" />
              Bekleyen Sinyaller ({pendingSignals?.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSignals?.map((signal) => (
                <SignalCard
                  key={signal?.id}
                  signal={signal}
                  onExecute={handleExecuteSignal}
                  onReject={handleRejectSignal}
                  isProcessing={processingSignalId === signal?.id}
                  loading={signalsLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Açık pozisyonlar artık üstteki "Otomatik İşlem Kontrolleri" içinde gösteriliyor */}
        {/* Signal History */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Sinyal Geçmişi
          </h2>
          <SignalHistory />
        </div>

        {/* Chart + Coin List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Grafik Analizi
            </h2>

            <div className="h-[500px] bg-background rounded-lg">
              <CandlestickChart
                symbol={chartSymbol}
                timeframe={timeframe || '5m'}
                height={500}
              />
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Coin Listesi
            </h3>
            <CoinListPanel onCoinSelect={handleCoinSelect} selectedCoin={selectedCoin} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TradingDashboard;
