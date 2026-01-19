import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { apiUrl } from '../../../services/apiBase';

const TradingControlPanel = ({
  selectedCoin,
  accountMode = 'TEST',
  autoMode,
  setAutoMode,
  gateStatus,
  setGateStatus,
  systemStatus,
  setSystemStatus,
  pendingAutoTrades = [],
  setPendingAutoTrades,
  activeCoins = [],
  setActiveCoins,
}) => {
  const canMutatePending = typeof setPendingAutoTrades === 'function';
  const canMutateActive = typeof setActiveCoins === 'function';
  const [botStatus, setBotStatus] = useState('active');

  // Real positions loaded from backend
  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionsError, setPositionsError] = useState('');

  // Pending auto config edit
  const [editingAutoId, setEditingAutoId] = useState(null);
  const [editingAutoPrice, setEditingAutoPrice] = useState('');

  // Stats
  const [winRate, setWinRate] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);

  const [botSettings, setBotSettings] = useState({
    maxPositions: 3,
    takeProfit: 3,
    stopLoss: 2,
    trailingStop: 1,
    autoRestart: true,
    signalFilter: 'medium',
  });

  // C) Fix filter: isTest may not exist
  // We normalize incoming positions to always have isTest boolean
  const displayPositions = useMemo(() => {
    const wantTest = accountMode === 'TEST';
    return (positions || []).filter((p) => {
      const isTest = !!p?.isTest;
      return wantTest ? isTest : !isTest;
    });
  }, [positions, accountMode]);

  // G) Calculate stats from displayPositions
  const totalPnL = useMemo(() => {
    return (displayPositions || []).reduce((sum, p) => sum + (Number(p?.pnl || 0) || 0), 0);
  }, [displayPositions]);

  const dailyPnL = useMemo(() => {
    // Simple approximation: positions PnL today
    // If backend later provides daily pnl, we can replace this
    return totalPnL;
  }, [totalPnL]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(price || 0));
  };

  const formatCompact = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(price || 0));
  };

  const formatTime = (dateOrTs) => {
    try {
      const d = typeof dateOrTs === 'number'
        ? new Date(dateOrTs * 1000)
        : (dateOrTs instanceof Date ? dateOrTs : new Date(dateOrTs));

      const diffMs = Date.now() - d.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      return `${hours}s ${minutes}d`;
    } catch (e) {
      return '-';
    }
  };

  const toggleBot = () => {
    setBotStatus((prev) => (prev === 'active' ? 'paused' : 'active'));
  };

  // E) Backend fetch function
  const normalizePosition = (raw, forcedIsTest) => {
    const symbol = raw?.symbol || raw?.instId || raw?.pair || raw?.market || '-';
    const sideRaw = (raw?.side || raw?.type || raw?.positionSide || raw?.direction || 'LONG').toString().toUpperCase();
    const type = sideRaw.includes('SHORT') || sideRaw === 'SELL' ? 'SHORT' : 'LONG';

    const entryPrice = Number(raw?.entryPrice ?? raw?.entry_price ?? raw?.avg_price ?? raw?.avgPrice ?? 0) || 0;
    const currentPrice = Number(raw?.currentPrice ?? raw?.mark_price ?? raw?.markPrice ?? raw?.last_price ?? raw?.lastPrice ?? raw?.price ?? entryPrice) || entryPrice;

    const quantity = Number(raw?.quantity ?? raw?.qty ?? raw?.size ?? raw?.pos ?? raw?.positionAmt ?? 0) || 0;

    const pnl = Number(raw?.pnl ?? raw?.pnl_try ?? raw?.pnl_usdt ?? raw?.unrealizedPnl ?? raw?.upl ?? 0) || 0;

    const leverage = raw?.leverage ? `${raw?.leverage}` : (raw?.lev ? `${raw?.lev}` : '1x');
    const exchange = raw?.exchange || raw?.exchange_id || raw?.ex || 'OKX';

    const openTime =
      raw?.openTime ||
      raw?.opened_at ||
      raw?.created_at ||
      raw?.ts ||
      raw?.ctime ||
      Date.now();

    const denom = (entryPrice * Math.abs(quantity)) || 0;
    const pnlPercent = denom > 0 ? (pnl / denom) * 100 : 0;

    const isTest = typeof forcedIsTest === 'boolean'
      ? forcedIsTest
      : !!(raw?.isTest ?? raw?.is_test ?? raw?.demo ?? raw?.dry_run ?? raw?.dryRun ?? raw?.mode === 'TEST');

    return {
      id: raw?.id ?? raw?.position_id ?? raw?.posId ?? `${symbol}-${exchange}-${openTime}`,
      symbol,
      type,
      entryPrice,
      currentPrice,
      quantity,
      pnl,
      pnlPercent,
      leverage,
      exchange,
      openTime,
      isTest
    };
  };

  const fetchPositions = async (signal) => {
    setPositionsError('');
    setPositionsLoading(true);

    try {
      // If backend requires login cookie, we must include credentials
      const res = await fetch(apiUrl('/api/positions'), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        signal
      });

      // If redirected to login or non-json, handle safely
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) {
        setPositions([]);
        setPositionsError('Pozisyon verisi JSON gelmedi');
        setPositionsLoading(false);
        return;
      }

      const json = await res.json();

      // Expected shapes:
      // { ok:true, positions:[...] } OR { positions:[...] } OR [...]
      const list = Array.isArray(json) ? json : (json?.positions || json?.data || []);
      const forcedIsTest = accountMode === 'TEST';

      const normalized = (list || []).map((p) => normalizePosition(p, forcedIsTest));
      setPositions(normalized);

      // Optional stats if backend provides, else keep 0
      const wr = Number(json?.win_rate ?? json?.winRate ?? 0) || 0;
      const tt = Number(json?.total_trades ?? json?.totalTrades ?? 0) || 0;
      setWinRate(wr);
      setTotalTrades(tt);
    } catch (e) {
      setPositions([]);
      setPositionsError('Pozisyonlar alınamadı');
    } finally {
      setPositionsLoading(false);
    }
  };

  // F) Fetch on mount and periodically
  useEffect(() => {
    const ac = new AbortController();

    // first load
    fetchPositions(ac.signal);

    // periodic refresh
    const t = setInterval(() => {
      fetchPositions(ac.signal);
    }, 10000);

    return () => {
      clearInterval(t);
      ac.abort();
    };
    // accountMode changes should refetch so DEMO and REAL do not mix
  }, [accountMode]);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Bot Kontrolü</h2>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              accountMode === 'TEST' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
            }`}>
              {accountMode === 'TEST' ? 'DEMO' : 'REAL'}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              botStatus === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                botStatus === 'active' ? 'bg-success' : 'bg-warning'
              } animate-pulse`} />
              <span className="text-xs md:text-sm font-medium">
                {botStatus === 'active' ? 'Aktif' : 'Kapat'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant={botStatus === 'active' ? 'outline' : 'default'}
            onClick={toggleBot}
            iconName={botStatus === 'active' ? 'Pause' : 'Play'}
            iconPosition="left"
            fullWidth
            size="sm"
          >
            {botStatus === 'active' ? 'Duraklat' : 'Başlat'}
          </Button>
          <Button
            variant="destructive"
            iconName="Square"
            iconPosition="left"
            fullWidth
            size="sm"
          >
            Durdur
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Toplam P&L</div>
            <div className={`text-base md:text-lg font-bold data-text ${
              totalPnL >= 0 ? 'text-success' : 'text-error'
            }`}>
              ₺{formatPrice(Math.abs(totalPnL))}
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Günlük P&L</div>
            <div className={`text-base md:text-lg font-bold data-text ${
              dailyPnL >= 0 ? 'text-success' : 'text-error'
            }`}>
              ₺{formatPrice(Math.abs(dailyPnL))}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {positionsLoading ? 'Pozisyonlar yükleniyor' : ''}
          {!positionsLoading && positionsError ? positionsError : ''}
        </div>
      </div>

      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-sm md:text-base font-semibold text-foreground mb-3">İstatistikler</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-muted-foreground">Kazanma Oranı</span>
            <span className="text-xs md:text-sm font-bold text-success data-text">{Number(winRate || 0).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-muted-foreground">Toplam İşlem</span>
            <span className="text-xs md:text-sm font-bold text-foreground data-text">{totalTrades || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-muted-foreground">Aktif Pozisyon</span>
            <span className="text-xs md:text-sm font-bold text-foreground data-text">{displayPositions?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:text-base font-semibold text-foreground">Bekleyen Auto İşlemler</h3>
              <span className="text-xs text-muted-foreground data-text">{pendingAutoTrades?.length || 0} adet</span>
            </div>

            <div className="space-y-2">
              {(pendingAutoTrades || []).length ? (
                (pendingAutoTrades || []).map((t) => (
                  <div key={t.id} className="bg-card rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{t.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          USDT: <span className="data-text">{t.amountUsdt}</span>
                          {t.targetPrice ? (
                            <>
                              {' '}• Hedef: <span className="data-text">{t.targetPrice}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!setPendingAutoTrades) return;
                            setEditingAutoId(t.id);
                            setEditingAutoPrice(t.targetPrice || '');
                          }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!setPendingAutoTrades) return;
                            setPendingAutoTrades((prev) => (prev || []).filter((x) => x.id !== t.id));
                          }}
                        >
                          Sil
                        </Button>
                      </div>
                    </div>

                    {editingAutoId === t.id ? (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="w-full bg-background border border-border rounded px-2 py-2 text-sm text-foreground"
                          placeholder="Hedef fiyat"
                          value={editingAutoPrice}
                          onChange={(e) => setEditingAutoPrice(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              if (!setPendingAutoTrades) return;
                              setPendingAutoTrades((prev) =>
                                (prev || []).map((x) =>
                                  x.id === t.id
                                    ? { ...x, targetPrice: (editingAutoPrice || '').trim() }
                                    : x
                                )
                              );
                              setEditingAutoId(null);
                              setEditingAutoPrice('');
                            }}
                          >
                            Kaydet
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAutoId(null);
                              setEditingAutoPrice('');
                            }}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Bekleyen auto işlem yok</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted rounded-lg border border-border p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:text-base font-semibold text-foreground">Aktif Coinler</h3>
              <span className="text-xs text-muted-foreground data-text">{activeCoins?.length || 0} pozisyon</span>
            </div>

            <div className="space-y-2">
              {(activeCoins || []).length ? (
                (activeCoins || []).map((p) => (
                  <div key={p.id || p.symbol} className="bg-card rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{p.symbol}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              (p.pnlTry || 0) >= 0 ? 'bg-success' : 'bg-error'
                            }`}
                          />
                          <span className={`text-xs font-medium ${
                            (p.pnlTry || 0) >= 0 ? 'text-success' : 'text-error'
                          }`}>
                            ₺{formatCompact(Math.abs(p.pnlTry || 0))}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Alış: <span className="data-text">{formatCompact(p.entry_price || 0)}</span>
                          {' '}• Anlık: <span className="data-text">{formatCompact(p.currentPrice || 0)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Miktar: <span className="data-text">{formatCompact(p.amount_usdt ?? p.amountUsdt ?? p.usdt ?? 0)}</span> USDT
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!setActiveCoins) return;
                          setActiveCoins((prev) => (prev || []).filter((x) => (x.id || x.symbol) !== (p.id || p.symbol)));
                        }}
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aktif coin bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 border-t border-border space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="Settings" size={16} />
          Bot Ayarları
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Maks. Pozisyon</span>
            <input
              type="number"
              min="1"
              value={botSettings.maxPositions}
              onChange={(e) =>
                setBotSettings((prev) => ({ ...prev, maxPositions: Number(e.target.value || 1) }))
              }
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Kâr Hedefi (%)</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={botSettings.takeProfit}
              onChange={(e) =>
                setBotSettings((prev) => ({ ...prev, takeProfit: Number(e.target.value || 0) }))
              }
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Stop Loss (%)</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={botSettings.stopLoss}
              onChange={(e) =>
                setBotSettings((prev) => ({ ...prev, stopLoss: Number(e.target.value || 0) }))
              }
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Trailing Stop (%)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={botSettings.trailingStop}
              onChange={(e) =>
                setBotSettings((prev) => ({ ...prev, trailingStop: Number(e.target.value || 0) }))
              }
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">Sinyal Filtresi</span>
            <select
              value={botSettings.signalFilter}
              onChange={(e) => setBotSettings((prev) => ({ ...prev, signalFilter: e.target.value }))}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              checked={botSettings.autoRestart}
              onChange={(e) =>
                setBotSettings((prev) => ({ ...prev, autoRestart: e.target.checked }))
              }
            />
            <span className="text-xs text-muted-foreground">Bağlantı koparsa otomatik devam et</span>
          </label>
        </div>

        <Button variant="default" fullWidth>
          Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
};

export default TradingControlPanel;
