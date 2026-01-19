import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import openaiService from '../../../services/openaiService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PortfolioRebalancingPanel = ({ allocationData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [riskTolerance, setRiskTolerance] = useState('orta');
  const [showDetails, setShowDetails] = useState(false);

  const analyzePortfolio = async () => {
    try {
      setLoading(true);
      setAnalysis(null);

      // Get portfolio data
      const totalValue = allocationData?.reduce((sum, asset) => sum + asset?.value, 0) || 0;
      const openPositions = allocationData?.length || 0;

      // Get recent trades count
      const { data: tradesData } = await supabase
        ?.from('trades')
        ?.select('id, actual_profit')
        ?.eq('user_id', user?.id)
        ?.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString());

      const recentTrades = tradesData?.length || 0;
      const profitableTrades = tradesData?.filter(t => t?.actual_profit > 0)?.length || 0;
      const winRate = recentTrades > 0 ? (profitableTrades / recentTrades) * 100 : 0;
      const totalPnL = tradesData?.reduce((sum, t) => sum + (t?.actual_profit || 0), 0) || 0;

      // Get risk metrics
      const { data: metricsData } = await supabase
        ?.rpc('calculate_performance_metrics', {
          p_user_id: user?.id,
          p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString(),
          p_end_date: new Date()?.toISOString()
        });

      const metrics = metricsData?.[0] || {};
      const maxDrawdown = (metrics?.max_drawdown || 0) * 100;
      const sharpeRatio = metrics?.sharpe_ratio || 0;
      const volatility = 15; // Default volatility

      // Prepare portfolio data
      const portfolioData = {
        totalBalance: totalValue,
        openPositions,
        recentTrades,
        winRate,
        totalPnL
      };

      // Prepare risk metrics with risk tolerance
      const riskMetrics = {
        maxDrawdown,
        sharpeRatio,
        volatility,
        marketTrend: 'Yükseliş',
        volatilityLevel: riskTolerance === 'düşük' ? 'Düşük' : riskTolerance === 'yüksek' ? 'Yüksek' : 'Orta',
        riskTolerance
      };

      // Call OpenAI service
      const { data, error } = await openaiService?.analyzePortfolioStrategy(portfolioData, riskMetrics);

      if (error) {
        alert(error);
        return;
      }

      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      alert('Portföy analizi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'düşük') return 'text-green-400';
    if (risk === 'yüksek') return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Portföy Yeniden Dengeleme Önerileri
          </h3>
          <p className="caption text-muted-foreground">
            AI destekli portföy optimizasyon analizi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Brain" size={24} className="text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Risk Toleransı
          </label>
          <div className="flex gap-2">
            {['düşük', 'orta', 'yüksek']?.map((level) => (
              <button
                key={level}
                onClick={() => setRiskTolerance(level)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  riskTolerance === level
                    ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:bg-card'
                }`}
              >
                {level?.charAt(0)?.toUpperCase() + level?.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={analyzePortfolio}
          disabled={loading || !allocationData || allocationData?.length === 0}
          className="w-full"
        >
          {loading ? (
            <>
              <Icon name="Loader" size={18} className="animate-spin" />
              <span>Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <Icon name="Sparkles" size={18} />
              <span>Portföyü Analiz Et</span>
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 mt-6">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="TrendingUp" size={20} className="text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Piyasa Koşulları
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis?.market_conditions_explanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="PieChart" size={20} className="text-blue-400 mt-1" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Portföy Değerlendirmesi
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis?.portfolio_assessment}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-yellow-400 mt-1" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Risk Analizi
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis?.risk_analysis}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Lightbulb" size={20} className="text-purple-400 mt-1" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Strateji Önerileri
                  </h4>
                  <ul className="space-y-2">
                    {analysis?.strategy_recommendations?.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="Target" size={20} className="text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Aksiyon Önerileri
                  </h4>
                  <ul className="space-y-2">
                    {analysis?.action_items?.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-semibold text-sm mt-0.5 flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Icon name="Info" size={16} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  AI destekli analiz - Risk toleransı: <span className={getRiskColor(riskTolerance)}>{riskTolerance}</span>
                </span>
              </div>
              <button
                onClick={() => analyzePortfolio()}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Icon name="RefreshCw" size={14} />
                Yenile
              </button>
            </div>
          </div>
        )}

        {!analysis && !loading && (
          <div className="text-center py-8">
            <Icon name="Brain" size={48} className="text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Portföyünüzü analiz etmek için yukarıdaki butona tıklayın
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioRebalancingPanel;