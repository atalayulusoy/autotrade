import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Brain, TrendingUp, AlertTriangle, Target, RefreshCw, Sparkles, Activity, BarChart3, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import RecommendationCard from './components/RecommendationCard';
import SentimentAnalysisPanel from './components/SentimentAnalysisPanel';
import PerformanceTracker from './components/PerformanceTracker';
import AIConfigPanel from './components/AIConfigPanel';
import { apiUrl } from '../../services/apiBase';
import Button from '../../components/ui/Button';

const AITradeRecommendations = () => {
  const { userProfile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExchange, setSelectedExchange] = useState('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [marketData, setMarketData] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  const supportedPairs = [
    'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT',
    'DOGE/USDT', 'MATIC/USDT', 'DOT/USDT', 'AVAX/USDT', 'LINK/USDT'
  ];

  const exchanges = ['OKX', 'Binance', 'Bybit', 'Gate.io', 'BTCTURK'];

  useEffect(() => {
    if (userProfile?.id) {
      loadMarketData();
    }
  }, [userProfile]);

  const loadMarketData = async () => {
    try {
      const { data: positions } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', userProfile?.id)
        ?.eq('status', 'waiting');

      const { data: recentTrades } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', userProfile?.id)
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      setMarketData({
        openPositions: positions?.length || 0,
        recentTrades: recentTrades || [],
        totalPnL: recentTrades?.reduce((sum, t) => sum + (t?.actual_profit || 0), 0) || 0
      });
    } catch (err) {
      console.error('Error loading market data:', err);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        apiUrl(`/api/public/ai-recommendations?symbols=${encodeURIComponent(supportedPairs.join(','))}`)
      );
      const json = await res.json();
      const recs = (json?.recommendations || []).map((rec, idx) => ({
        id: `rec-${Date.now()}-${idx}`,
        symbol: rec?.symbol,
        signalType: rec?.signal_type,
        entryPrice: Number(rec?.entry_price || 0),
        confidence: Number(rec?.confidence || 0),
        riskLevel: rec?.risk_level || 'Orta',
        profitTarget: Number(rec?.profit_target_percent || 0),
        stopLoss: Number(rec?.stop_loss_percent || 0),
        analysis: rec?.analysis_summary || 'Otomatik piyasa değerlendirmesi',
        sentimentAnalysis: 'Likidite, hacim ve fiyat momentumu analiz edildi.',
        technicalPatterns: [],
        riskRewardRatio: `${Number(rec?.profit_target_percent || 0).toFixed(1)}/${Number(rec?.stop_loss_percent || 0).toFixed(1)}`,
        timestamp: new Date()?.toISOString(),
        exchange: exchanges?.[Math.floor(Math.random() * exchanges?.length)],
      }));

      setRecommendations(recs?.filter((r) => r?.confidence >= confidenceThreshold));
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('AI önerileri oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRecommendation = async (recommendation) => {
    try {
      const { data: apiKey } = await supabase
        ?.from('exchange_api_keys')
        ?.select('*')
        ?.eq('user_id', userProfile?.id)
        ?.eq('is_active', true)
        ?.limit(1)
        ?.single();

      if (!apiKey) {
        alert('Aktif borsa API anahtarı bulunamadı. Lütfen önce API anahtarınızı ekleyin.');
        return;
      }

      const { data: operation, error: opError } = await supabase
        ?.from('trading_operations')
        ?.insert({
          user_id: userProfile?.id,
          exchange: apiKey?.exchange,
          symbol: recommendation?.symbol,
          operation_type: recommendation?.signalType,
          amount_usdt: recommendation?.recommendedAmount,
          entry_price: recommendation?.entryPrice,
          status: 'waiting'
        })
        ?.select()
        ?.single();

      if (opError) throw opError;

      alert('✅ İşlem başarıyla oluşturuldu!');
      loadMarketData();
    } catch (err) {
      alert('❌ İşlem oluşturulamadı: ' + err?.message);
    }
  };

  return (
    <MainLayout>
      <div className="space-mobile">
        {/* Header - Mobile Optimized */}
        <div className="card-mobile">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex-shrink-0">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-responsive-h1 font-bold text-foreground">AI Trade Recommendations</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Yapay zeka destekli ticaret önerileri ve piyasa analizi</p>
            </div>
          </div>
        </div>

        {/* Stats Overview - Mobile Grid */}
        {marketData && (
          <div className="grid-mobile-3">
            <div className="card-mobile-compact">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Açık Pozisyonlar</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{marketData?.openPositions}</p>
                </div>
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
              </div>
            </div>
            <div className="card-mobile-compact">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Toplam P&L</p>
                  <p className={`text-xl sm:text-2xl font-bold ${
                    marketData?.totalPnL >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    ${marketData?.totalPnL?.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success flex-shrink-0" />
              </div>
            </div>
            <div className="card-mobile-compact">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Aktif Öneriler</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{recommendations?.length}</p>
                </div>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        )}

        {/* Controls - Mobile Optimized */}
        <div className="card-mobile">
          <div className="grid-mobile-1 sm:grid-mobile-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Borsa Seçimi</label>
              <select
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e?.target?.value)}
                className="select-mobile"
              >
                <option value="all">Tüm Borsalar</option>
                {exchanges?.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Güven Eşiği: {confidenceThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e?.target?.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateRecommendations}
                disabled={loading}
                className="btn-touch-primary bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm">{loading ? 'Analiz Ediliyor...' : 'Önerileri Yenile'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs - Mobile Scrollable */}
        <div className="tabs-mobile">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`tab-mobile ${
              activeTab === 'recommendations' ?'bg-primary text-primary-foreground' :'bg-card text-muted-foreground hover:text-foreground active:scale-95'
            }`}
          >
            <Target className="w-4 h-4 mr-2" />
            Öneriler
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`tab-mobile ${
              activeTab === 'sentiment' ?'bg-primary text-primary-foreground' :'bg-card text-muted-foreground hover:text-foreground active:scale-95'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Duyarlılık
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`tab-mobile ${
              activeTab === 'performance'
                ? 'bg-primary text-primary-foreground' :'bg-card text-muted-foreground hover:text-foreground active:scale-95'
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Performans
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`tab-mobile ${
              activeTab === 'config' ?'bg-primary text-primary-foreground' :'bg-card text-muted-foreground hover:text-foreground active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Ayarlar
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card-mobile bg-error/10 border-error/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error mb-1">Hata</p>
                <p className="text-xs text-error/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'recommendations' && (
          <div>
            {loading ? (
              <div className="card-mobile text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">AI önerileri oluşturuluyor...</p>
              </div>
            ) : recommendations?.length > 0 ? (
              <div className="grid-mobile-1 lg:grid-mobile-2">
                {recommendations
                  ?.filter(r => selectedExchange === 'all' || r?.exchange === selectedExchange)
                  ?.map((rec) => (
                    <RecommendationCard
                      key={rec?.id}
                      recommendation={rec}
                      onExecute={handleExecuteRecommendation}
                    />
                  ))}
              </div>
            ) : (
              <div className="card-mobile text-center py-12">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">Henüz öneri yok</p>
                <p className="text-sm text-muted-foreground mb-4">
                  AI destekli ticaret önerileri almak için 'Önerileri Yenile' butonuna tıklayın
                </p>
                <Button
                  onClick={generateRecommendations}
                  className="btn-touch-primary bg-primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Önerileri Oluştur
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="card-mobile">
            <SentimentAnalysisPanel symbols={supportedPairs} />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="card-mobile">
            <PerformanceTracker recommendations={recommendations} />
          </div>
        )}

        {activeTab === 'config' && (
          <div className="card-mobile">
            <AIConfigPanel />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AITradeRecommendations;
