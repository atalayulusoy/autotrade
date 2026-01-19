import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { TrendingUp, AlertCircle, DollarSign, Clock, Zap, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

import PriceComparisonTable from './components/PriceComparisonTable';
import OpportunityCard from './components/OpportunityCard';
import SpreadChart from './components/SpreadChart';
import AlertConfigPanel from './components/AlertConfigPanel';
import RiskAssessmentPanel from './components/RiskAssessmentPanel';
import TransferTimeMonitor from './components/TransferTimeMonitor';
import Icon from '../../components/AppIcon';


const ArbitrageMonitor = () => {
  const { userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [minSpread, setMinSpread] = useState(0.5);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedExchanges, setSelectedExchanges] = useState(['OKX', 'Binance', 'Bybit', 'Gate.io', 'BTCTURK']);
  const [priceData, setPriceData] = useState([]);
  const [spreadData, setSpreadData] = useState([]);

  const exchanges = ['OKX', 'Binance', 'Bybit', 'Gate.io', 'BTCTURK'];
  const tradingPairs = [
    'BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT',
    'DOGE/USDT', 'MATIC/USDT', 'DOT/USDT', 'AVAX/USDT', 'LINK/USDT'
  ];

  useEffect(() => {
    if (userProfile?.id) {
      loadArbitrageOpportunities();
    }
  }, [userProfile, minSpread]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadArbitrageOpportunities();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, minSpread]);

  const loadArbitrageOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        ?.from('arbitrage_opportunities')
        ?.select('*')
        ?.gte('profit_percentage', minSpread)
        ?.gte('expires_at', new Date()?.toISOString())
        ?.order('profit_percentage', { ascending: false })
        ?.limit(50);

      if (dbError) throw dbError;

      const enrichedOpportunities = (data || [])?.map(opp => ({
        ...opp,
        estimatedProfit: calculateEstimatedProfit(opp),
        executionSpeed: calculateExecutionSpeed(opp),
        riskScore: calculateRiskScore(opp)
      }));

      setOpportunities(enrichedOpportunities);
    } catch (err) {
      console.error('Error loading arbitrage opportunities:', err);
      setError(err?.message || 'Arbitraj fırsatları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedProfit = (opportunity) => {
    const tradingFee = 0.001;
    const transferFee = 0.0005;
    const grossProfit = (opportunity?.sell_price - opportunity?.buy_price) / opportunity?.buy_price;
    const netProfit = grossProfit - (tradingFee * 2) - transferFee;
    return (netProfit * 100)?.toFixed(2);
  };

  const calculateExecutionSpeed = (opportunity) => {
    const transferTimes = {
      'BTC/USDT': 30,
      'ETH/USDT': 5,
      'XRP/USDT': 3,
      'ADA/USDT': 10,
      'SOL/USDT': 2,
      'DOGE/USDT': 5,
      'MATIC/USDT': 3,
      'DOT/USDT': 10,
      'AVAX/USDT': 2,
      'LINK/USDT': 5
    };
    return transferTimes?.[opportunity?.symbol] || 10;
  };

  const calculateRiskScore = (opportunity) => {
    let score = 0;
    if (opportunity?.profit_percentage > 2) score += 30;
    else if (opportunity?.profit_percentage > 1) score += 20;
    else score += 10;

    const executionSpeed = calculateExecutionSpeed(opportunity);
    if (executionSpeed < 5) score += 30;
    else if (executionSpeed < 15) score += 20;
    else score += 10;

    const volatility = Math.random() * 10;
    if (volatility < 3) score += 40;
    else if (volatility < 6) score += 30;
    else score += 20;

    return Math.min(score, 100);
  };

  const handleRefresh = () => {
    loadArbitrageOpportunities();
  };

  const handleExecuteArbitrage = async (opportunity) => {
    try {
      const { error: insertError } = await supabase
        ?.from('trading_operations')
        ?.insert({
          user_id: userProfile?.id,
          symbol: opportunity?.symbol,
          signal_type: 'BUY',
          entry_price: opportunity?.buy_price,
          target_price: opportunity?.sell_price,
          exchange: opportunity?.buy_exchange,
          status: 'waiting',
          metadata: {
            arbitrage: true,
            sell_exchange: opportunity?.sell_exchange,
            expected_profit: opportunity?.profit_percentage
          }
        });

      if (insertError) throw insertError;
      alert('Arbitraj başarıyla gerçekleştirildi!');
    } catch (err) {
      console.error('Error executing arbitrage:', err);
      alert('Arbitraj gerçekleştirilemedi: ' + err?.message);
    }
  };

  const handleActivateBot = async (opportunity) => {
    try {
      const { error: insertError } = await supabase
        ?.from('trading_operations')
        ?.insert({
          user_id: userProfile?.id,
          symbol: opportunity?.symbol,
          signal_type: 'BUY',
          entry_price: opportunity?.buy_price,
          target_price: opportunity?.sell_price,
          exchange: opportunity?.buy_exchange,
          status: 'waiting',
          metadata: {
            arbitrage: true,
            sell_exchange: opportunity?.sell_exchange,
            expected_profit: opportunity?.profit_percentage
          }
        });

      if (insertError) throw insertError;
      alert('Arbitraj botu başarıyla aktifleştirildi!');
    } catch (err) {
      console.error('Error activating arbitrage bot:', err);
      alert('Bot aktifleştirilemedi: ' + err?.message);
    }
  };

  const tabs = [
    { id: 'opportunities', label: 'Fırsatlar', icon: Zap },
    { id: 'comparison', label: 'Fiyat Karşılaştırma', icon: TrendingUp },
    { id: 'charts', label: 'Spread Grafikleri', icon: DollarSign },
    { id: 'alerts', label: 'Uyarı Ayarları', icon: Bell },
    { id: 'risk', label: 'Risk Analizi', icon: AlertCircle },
    { id: 'transfer', label: 'Transfer Süreleri', icon: Clock }
  ];

  const topOpportunities = opportunities?.slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
              Arbitraj Takibi
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Borsalar arası fiyat farkları ve fırsatlar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs sm:text-sm text-muted-foreground">Canlı Veri</span>
            </div>
            <button className="btn-touch-secondary flex items-center gap-2">
              <Icon name="Settings" size={18} />
              <span className="text-sm font-medium hidden sm:inline">Ayarlar</span>
            </button>
          </div>
        </div>

        <AlertConfigPanel
          minSpread={minSpread}
          onMinSpreadChange={setMinSpread}
          selectedExchanges={selectedExchanges}
          onExchangesChange={setSelectedExchanges}
          userProfile={userProfile}
          onUpdate={loadArbitrageOpportunities}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {opportunities?.map((opp) => (
            <OpportunityCard
              key={opp?.id}
              opportunity={opp}
              onExecute={handleExecuteArbitrage}
              onActivate={handleActivateBot}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card-mobile">
            <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
              Fiyat Karşılaştırma
            </h2>
            <PriceComparisonTable 
              data={priceData} 
              exchanges={exchanges}
              tradingPairs={tradingPairs}
              opportunities={opportunities}
            />
          </div>
          <div className="card-mobile">
            <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
              Spread Grafiği
            </h2>
            <SpreadChart 
              data={spreadData} 
              opportunities={opportunities}
              selectedPair={selectedPair}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card-mobile">
            <RiskAssessmentPanel opportunities={opportunities} />
          </div>
          <div className="card-mobile">
            <TransferTimeMonitor 
              exchanges={selectedExchanges} 
              tradingPairs={tradingPairs}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArbitrageMonitor;