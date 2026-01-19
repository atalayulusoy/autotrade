import React, { useMemo, useState } from 'react';
import { Zap, Search } from 'lucide-react';
import { apiUrl } from '../../../services/apiBase';

const AutoTradingPanel = ({
  selectedCoin,
  setSelectedCoin,
  coins = [],
  testMode = 'TEST',
  balance = 0,
  pendingAutoTrades = [],
  setPendingAutoTrades,
  onActiveCoinUpsert,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [useAllBalance, setUseAllBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedCoins = useMemo(() => {
    const list = (coins || [])
      .map((c) => (typeof c === 'string' ? c : c?.symbol))
      .filter(Boolean);
    if (list.length) return list;
    return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT'];
  }, [coins]);

  const filteredCoins = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    const list = normalizedCoins || [];
    if (!q) return list;
    return list.filter((c) => String(c).toLowerCase().includes(q));
  }, [normalizedCoins, searchTerm]);

  const effectiveUsdt = useMemo(() => {
    if (useAllBalance) return Math.max(0, Number(balance || 0));
    const n = Number(String(usdtAmount || '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }, [useAllBalance, usdtAmount, balance]);

  const addPending = (row) => {
    if (!setPendingAutoTrades) return;
    setPendingAutoTrades((prev) => [row, ...(prev || [])]);
  };

  const handleCreateAuto = async () => {
    setError('');
    const symbol = String(selectedCoin || '').trim();
    if (!symbol || !symbol.includes('/')) {
      setError('Coin seç');
      return;
    }
    if (!effectiveUsdt || effectiveUsdt <= 0) {
      setError('USDT miktarı gir');
      return;
    }

    setIsLoading(true);
    try {
      // Demo endpoint: DRY_RUN mantığında pozisyon açar
      const resp = await fetch(apiUrl('/api/demo/auto'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo',
          symbol,
          amount_usdt: effectiveUsdt,
        }),
      });

      const text = await resp.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Sunucu yanıtı okunamadı');
      }
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || 'İşlem başarısız');
      }

      // Pending listesine ekle
      addPending({
        id: `auto_${Date.now()}`,
        symbol,
        amount_usdt: effectiveUsdt,
        created_at: new Date().toISOString(),
        status: 'ON',
      });

      // Aktif coin listesine ekle
      const p = data?.position;
      if (onActiveCoinUpsert) {
        onActiveCoinUpsert({
          symbol,
          amount_usdt: effectiveUsdt,
          entry_price: p?.entry_price,
          ts: p?.ts,
          source: 'AUTO',
        });
      }

      // Formu temizle
      if (!useAllBalance) setUsdtAmount('');
    } catch (e) {
      setError(e?.message || 'Hata');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Auto İşlemler</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Coin ara</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="BTC/USDT"
              className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">Coin seçimi</label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
          >
            {filteredCoins.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted-foreground mb-2">USDT miktarı</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={useAllBalance ? '' : usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
              disabled={useAllBalance}
              placeholder="Örn. 20"
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground disabled:opacity-60"
            />
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useAllBalance}
                onChange={(e) => setUseAllBalance(e.target.checked)}
              />
              Tüm bakiye
            </label>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Mod: {testMode} • Kullanılacak: {effectiveUsdt.toFixed(2)} USDT
          </div>
        </div>

        {error ? (
          <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-2">{error}</div>
        ) : null}

        <button
          onClick={handleCreateAuto}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {isLoading ? 'Gönderiliyor' : 'Auto işlem ekle'}
        </button>

        {pendingAutoTrades?.length ? (
          <div className="text-xs text-muted-foreground pt-2">
            Bekleyen auto işlemler, Otomatik işlem kontrolleri bölümünde görünür
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AutoTradingPanel;
