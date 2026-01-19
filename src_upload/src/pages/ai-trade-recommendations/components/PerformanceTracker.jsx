import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Award, AlertCircle } from 'lucide-react';

const PerformanceTracker = ({ recommendations }) => {
  const [metrics, setMetrics] = useState({
    totalRecommendations: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    avgConfidence: 0,
    buySignals: 0,
    sellSignals: 0,
    avgProfitTarget: 0,
    avgStopLoss: 0
  });

  useEffect(() => {
    calculateMetrics();
  }, [recommendations]);

  const calculateMetrics = () => {
    if (!recommendations || recommendations?.length === 0) {
      return;
    }

    const total = recommendations?.length;
    const high = recommendations?.filter(r => r?.confidence >= 80)?.length;
    const medium = recommendations?.filter(r => r?.confidence >= 70 && r?.confidence < 80)?.length;
    const low = recommendations?.filter(r => r?.confidence < 70)?.length;
    const avgConf = recommendations?.reduce((sum, r) => sum + r?.confidence, 0) / total;
    const buy = recommendations?.filter(r => r?.signalType === 'BUY')?.length;
    const sell = recommendations?.filter(r => r?.signalType === 'SELL')?.length;
    const avgProfit = recommendations?.reduce((sum, r) => sum + r?.profitTarget, 0) / total;
    const avgStop = recommendations?.reduce((sum, r) => sum + r?.stopLoss, 0) / total;

    setMetrics({
      totalRecommendations: total,
      highConfidence: high,
      mediumConfidence: medium,
      lowConfidence: low,
      avgConfidence: avgConf,
      buySignals: buy,
      sellSignals: sell,
      avgProfitTarget: avgProfit,
      avgStopLoss: avgStop
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-green-400" />
        <h2 className="text-white font-semibold text-xl">Performans Metrikleri</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Toplam Öneri</p>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{metrics?.totalRecommendations}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Ortalama Güven</p>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{metrics?.avgConfidence?.toFixed(1)}%</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Ort. Kar Hedefi</p>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">+{metrics?.avgProfitTarget?.toFixed(2)}%</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Ort. Stop Loss</p>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">-{metrics?.avgStopLoss?.toFixed(2)}%</p>
        </div>
      </div>

      {/* Confidence Distribution */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4">Güven Seviyesi Dağılımı</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Yüksek Güven (≥80%)</span>
              <span className="text-green-400 font-semibold">{metrics?.highConfidence}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${metrics?.totalRecommendations > 0 ? (metrics?.highConfidence / metrics?.totalRecommendations) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Orta Güven (70-79%)</span>
              <span className="text-blue-400 font-semibold">{metrics?.mediumConfidence}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${metrics?.totalRecommendations > 0 ? (metrics?.mediumConfidence / metrics?.totalRecommendations) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Düşük Güven (&lt;70%)</span>
              <span className="text-yellow-400 font-semibold">{metrics?.lowConfidence}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all"
                style={{ width: `${metrics?.totalRecommendations > 0 ? (metrics?.lowConfidence / metrics?.totalRecommendations) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Signal Type Distribution */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4">Sinyal Tipi Dağılımı</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">BUY Sinyalleri</span>
            </div>
            <p className="text-3xl font-bold text-white">{metrics?.buySignals}</p>
            <p className="text-slate-400 text-sm mt-1">
              {metrics?.totalRecommendations > 0 ? ((metrics?.buySignals / metrics?.totalRecommendations) * 100)?.toFixed(1) : 0}% toplam
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
              <span className="text-red-400 font-semibold">SELL Sinyalleri</span>
            </div>
            <p className="text-3xl font-bold text-white">{metrics?.sellSignals}</p>
            <p className="text-slate-400 text-sm mt-1">
              {metrics?.totalRecommendations > 0 ? ((metrics?.sellSignals / metrics?.totalRecommendations) * 100)?.toFixed(1) : 0}% toplam
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 font-semibold mb-1">Performans Takibi</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Bu metrikler, AI tarafından oluşturulan önerilerin güven seviyelerini ve dağılımını gösterir.
              Gerçek performans verileri, önerilerin işleme alınması ve sonuçlanması sonrasında güncellenecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracker;