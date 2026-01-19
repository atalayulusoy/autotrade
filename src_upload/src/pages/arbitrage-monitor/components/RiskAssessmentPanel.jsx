import React from 'react';
import { AlertTriangle, TrendingDown, Clock, DollarSign, Activity } from 'lucide-react';

const RiskAssessmentPanel = ({ opportunities }) => {
  const calculateSlippageImpact = (opportunity) => {
    const baseSlippage = 0.1;
    const volatilityFactor = Math.random() * 0.3;
    return (baseSlippage + volatilityFactor)?.toFixed(2);
  };

  const calculateVolatilityRisk = (opportunity) => {
    const volatility = Math.random() * 10;
    if (volatility < 3) return { level: 'Düşük', color: 'text-success', score: 20 };
    if (volatility < 6) return { level: 'Orta', color: 'text-yellow-500', score: 50 };
    return { level: 'Yüksek', color: 'text-error', score: 80 };
  };

  const calculateExecutionProbability = (opportunity) => {
    const baseProb = 85;
    const spreadFactor = opportunity?.profit_percentage * 2;
    const speedFactor = opportunity?.executionSpeed < 10 ? 10 : 0;
    return Math.min(baseProb + spreadFactor + speedFactor, 99)?.toFixed(0);
  };

  const topRiskyOpportunities = opportunities
    ?.map(opp => ({
      ...opp,
      slippage: calculateSlippageImpact(opp),
      volatility: calculateVolatilityRisk(opp),
      executionProb: calculateExecutionProbability(opp)
    }))
    ?.sort((a, b) => b?.profit_percentage - a?.profit_percentage)
    ?.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            <p className="text-sm text-muted-foreground">Ortalama Risk Skoru</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(opportunities?.reduce((sum, o) => sum + o?.riskScore, 0) / (opportunities?.length || 1))?.toFixed(0)}/100
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} className="text-error" />
            <p className="text-sm text-muted-foreground">Ortalama Slippage</p>
          </div>
          <p className="text-2xl font-bold text-foreground">0.25%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} className="text-blue-500" />
            <p className="text-sm text-muted-foreground">Piyasa Volatilitesi</p>
          </div>
          <p className="text-2xl font-bold text-yellow-500">Orta</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-success" />
            <p className="text-sm text-muted-foreground">Başarı Oranı</p>
          </div>
          <p className="text-2xl font-bold text-success">87%</p>
        </div>
      </div>

      {/* Detailed Risk Analysis */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Detaylı Risk Analizi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Çift</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Spread</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Slippage</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Volatilite</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Başarı Olasılığı</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Risk Skoru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topRiskyOpportunities?.map(opp => (
                <tr key={opp?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{opp?.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {opp?.buy_exchange} → {opp?.sell_exchange}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-success">+{opp?.profit_percentage?.toFixed(2)}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-error">-{opp?.slippage}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={opp?.volatility?.color}>{opp?.volatility?.level}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-full max-w-[100px] bg-muted rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full"
                          style={{ width: `${opp?.executionProb}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{opp?.executionProb}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${
                      opp?.riskScore >= 80 ? 'text-success' :
                      opp?.riskScore >= 60 ? 'text-yellow-500': 'text-error'
                    }`}>
                      {opp?.riskScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Factors Explanation */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Risk Faktörleri</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <TrendingDown className="text-error flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-foreground">Slippage Etkisi</p>
              <p className="text-sm text-muted-foreground mt-1">
                İşlem sırasında fiyat kayması nedeniyle oluşabilecek kayıp. Yüksek hacimli işlemlerde daha fazla etki eder.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Activity className="text-yellow-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-foreground">Piyasa Volatilitesi</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fiyat dalgalanmaları arbitraj fırsatının kaybolmasına neden olabilir. Düşük volatilite tercih edilir.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="text-blue-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-foreground">İşlem Hızı</p>
              <p className="text-sm text-muted-foreground mt-1">
                Transfer ve onay süreleri uzadıkça fırsat kaçırma riski artar. Hızlı blockchain'ler avantajlıdır.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <DollarSign className="text-success flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-foreground">İşlem Ücretleri</p>
              <p className="text-sm text-muted-foreground mt-1">
                Trading ve transfer ücretleri net karı azaltır. Yüksek spread'li fırsatlar tercih edilmelidir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentPanel;