import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, RefreshCw } from 'lucide-react';
import { openaiService } from '../../../services/openaiService';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';

const AIAnalysisPanel = () => {
  const { userProfile } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userProfile?.id) {
      loadPortfolioData();
    }
  }, [userProfile]);

  const loadPortfolioData = async () => {
    try {
      // Get open positions
      const { data: positions } = await supabase?.
      from('trading_operations')?.
      select('*')?.
      eq('user_id', userProfile?.id)?.
      eq('status', 'waiting');

      // Get recent trades (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);

      const { data: recentTrades } = await supabase?.
      from('trading_operations')?.
      select('*')?.
      eq('user_id', userProfile?.id)?.
      gte('created_at', thirtyDaysAgo?.toISOString());

      // Calculate metrics
      const totalPnL = recentTrades?.reduce((sum, t) => sum + (t?.actual_profit || 0), 0) || 0;
      const profitableTrades = recentTrades?.filter((t) => t?.actual_profit > 0)?.length || 0;
      const winRate = recentTrades?.length > 0 ? profitableTrades / recentTrades?.length * 100 : 0;

      // Calculate risk metrics (simplified)
      const profits = recentTrades?.map((t) => t?.actual_profit || 0) || [];
      const maxDrawdown = Math.min(...profits, 0);
      const avgProfit = profits?.length > 0 ? profits?.reduce((a, b) => a + b, 0) / profits?.length : 0;
      const stdDev = Math.sqrt(profits?.reduce((sq, n) => sq + Math.pow(n - avgProfit, 2), 0) / (profits?.length || 1));
      const sharpeRatio = stdDev !== 0 ? avgProfit / stdDev : 0;

      setPortfolioData({
        totalBalance: userProfile?.balance || 0,
        openPositions: positions?.length || 0,
        recentTrades: recentTrades?.length || 0,
        winRate,
        totalPnL,
        maxDrawdown: Math.abs(maxDrawdown),
        sharpeRatio,
        volatility: stdDev,
        marketTrend: 'Yükseliş',
        volatilityLevel: 'Orta'
      });
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    }
  };

  const analyzePortfolio = async () => {
    if (!portfolioData) return;

    setLoading(true);
    setError(null);

    const { data, error: analysisError } = await openaiService?.analyzePortfolioStrategy(
      portfolioData,
      {
        maxDrawdown: portfolioData?.maxDrawdown,
        sharpeRatio: portfolioData?.sharpeRatio,
        volatility: portfolioData?.volatility,
        marketTrend: portfolioData?.marketTrend,
        volatilityLevel: portfolioData?.volatilityLevel
      }
    );

    if (analysisError) {
      setError(analysisError);
    } else {
      setAnalysis(data);
    }

    setLoading(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold text-base">AI Portföy Analizi</h2>
          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">OpenAI Destekli</span>
        </div>
        <Button
          onClick={analyzePortfolio}
          disabled={loading || !portfolioData}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">

          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
        </Button>
      </div>

      {/* Portfolio Metrics */}
      {portfolioData &&
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Toplam Bakiye</p>
            <p className="text-white font-semibold">${portfolioData?.totalBalance?.toFixed(2)}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Açık Pozisyon</p>
            <p className="text-white font-semibold">{portfolioData?.openPositions}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Kazanma Oranı</p>
            <p className="text-green-400 font-semibold">{portfolioData?.winRate?.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs mb-1">Toplam P&L</p>
            <p className={`font-semibold ${
          portfolioData?.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`
          }>
              ${portfolioData?.totalPnL?.toFixed(2)}
            </p>
          </div>
        </div>
      }

      {error &&
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">Analiz Hatası</p>
          </div>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      }

      {loading &&
      <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
          <p className="text-slate-400">AI portföyünüzü analiz ediyor...</p>
        </div>
      }

      {!loading && analysis &&
      <div className="space-y-4">
          {/* Market Conditions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-blue-400 font-semibold">Piyasa Koşulları</h3>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {analysis?.market_conditions_explanation}
            </p>
          </div>

          {/* Portfolio Assessment */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-green-400 font-semibold">Portföy Değerlendirmesi</h3>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {analysis?.portfolio_assessment}
            </p>
          </div>

          {/* Risk Analysis */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-yellow-400 font-semibold">Risk Analizi</h3>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {analysis?.risk_analysis}
            </p>
          </div>

          {/* Strategy Recommendations */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <h3 className="text-purple-400 font-semibold">Strateji Önerileri</h3>
            </div>
            <ul className="space-y-2">
              {analysis?.strategy_recommendations?.map((rec, index) =>
            <li key={index} className="flex items-start gap-2 text-white text-sm">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
            )}
            </ul>
          </div>

          {/* Action Items */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-green-400 font-semibold">Aksiyon Önerileri</h3>
            </div>
            <ul className="space-y-2">
              {analysis?.action_items?.map((action, index) =>
            <li key={index} className="flex items-start gap-2 text-white text-sm">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{action}</span>
                </li>
            )}
            </ul>
          </div>
        </div>
      }

      {!loading && !analysis && !error &&
      <div className="text-center py-8">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">Portföy analizi için butona tıklayın</p>
          <p className="text-slate-500 text-sm">AI, piyasa koşullarını ve performansınızı analiz edecek</p>
        </div>
      }
    </div>);

};

export default AIAnalysisPanel;