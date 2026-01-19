import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, TrendingDown } from 'lucide-react';
import { apiUrl } from '../../../services/apiBase';

const ManualTradingPanel = ({
  selectedExchange = 'OKX',
  selectedCoin,
  testMode = 'TEST',
  balance = 0,
  onExecute,
  onActiveCoinUpsert,
}) => {
  const [coinList, setCoinList] = useState([]);
  const [coin, setCoin] = useState(selectedCoin || 'BTC/USDT');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('20');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCoin(selectedCoin || 'BTC/USDT');
  }, [selectedCoin]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/public/coins'));
        const data = await res.json();
        const list = Array.isArray(data?.coins) ? data.coins : Array.isArray(data) ? data : [];
        if (alive) setCoinList(list);
      } catch {
        if (alive) setCoinList([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filteredCoins = useMemo(() => {
    const q = String(coin || '').toUpperCase();
    return coinList
      .map((c) => (typeof c === 'string' ? { symbol: c } : c))
      .filter((c) => String(c.symbol || '').toUpperCase().includes(q))
      .slice(0, 200);
  }, [coinList, coin]);

  const quickAmounts = [10, 20, 50, 100, 500];

  const submit = async () => {
    setMessage('');
    const symbol = String(coin || '').trim() || 'BTC/USDT';
    const amountUsdt = Number(String(amount || '').replace(',', '.'));
    if (!symbol.includes('/')) {
      setMessage('Coin formatı hatalı');
      return;
    }
    if (!amountUsdt || amountUsdt <= 0) {
      setMessage('USDT miktarı hatalı');
      return;
    }

    setLoading(true);
    try {
      // DEMO BUY
      if (side === 'BUY') {
        const res = await fetch(apiUrl('/api/demo/auto'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'demo',
            symbol,
            amount_usdt: amountUsdt,
            exchange: selectedExchange,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setMessage(data?.error || 'İşlem başarısız');
          return;
        }

        onExecute?.({ side: 'BUY', symbol, amountUsdt });
        onActiveCoinUpsert?.({
          symbol,
          amountUsdt,
          price: data?.position?.entry_price || null,
          time: Date.now(),
        });
        setMessage('BUY işlendi');
        return;
      }

      // DEMO SELL
      setMessage('SELL demo için TradingView SELL ile yapılır');
      onExecute?.({ side: 'SELL', symbol, amountUsdt });
    } catch (e) {
      setMessage('İşlem hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart size={18} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Manuel İşlemler</h3>
      </div>

      <div className="bg-background/50 rounded-lg p-3 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setSide('BUY')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${
              side === 'BUY'
                ? 'bg-success text-success-foreground border-success'
                : 'bg-transparent text-muted-foreground border-border'
            }`}
          >
            AL (BUY)
          </button>
          <button
            onClick={() => setSide('SELL')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${
              side === 'SELL'
                ? 'bg-danger text-danger-foreground border-danger'
                : 'bg-transparent text-muted-foreground border-border'
            }`}
          >
            SAT (SELL)
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Coin Seçimi</label>
            <select
              value={coin}
              onChange={(e) => setCoin(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
            >
              {filteredCoins.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Miktar (USDT)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="px-2 py-1 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground"
                >
                  {v} USDT
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mevcut Bakiye</span>
            <span className="text-foreground font-semibold">{Number(balance || 0).toFixed(2)} USDT</span>
          </div>

          {message ? <div className="text-xs text-muted-foreground">{message}</div> : null}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
          >
            {loading ? 'İşleniyor' : `${side === 'BUY' ? 'AL' : 'SAT'} - ${String(coin || 'BTC/USDT')}`}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingDown size={14} />
        <span>
          Mod: {testMode === 'TEST' ? 'Demo' : 'Gerçek'}
        </span>
      </div>
    </div>
  );
};

export default ManualTradingPanel;
