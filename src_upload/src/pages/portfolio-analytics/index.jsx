import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import PerformanceMetricCard from './components/PerformanceMetricCard';
import PerformanceChart from './components/PerformanceChart';
import AssetAllocationChart from './components/AssetAllocationChart';
import PerformanceBreakdownTable from './components/PerformanceBreakdownTable';
import ExportReportModal from './components/ExportReportModal';
import FilterControls from './components/FilterControls';
import RealTimePnLChart from './components/RealTimePnLChart';
import PerformanceMetricsPanel from './components/PerformanceMetricsPanel';
import PDFReportGenerator from './components/PDFReportGenerator';
import RiskManagementPanel from './components/RiskManagementPanel';
import PortfolioRebalancingPanel from './components/PortfolioRebalancingPanel';
import Icon from '../../components/AppIcon';

const PortfolioAnalytics = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('all');
  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  const performanceData = [
    { date: '01 Oca', value: 125000, benchmark: 120000 },
    { date: '05 Oca', value: 128500, benchmark: 121500 },
    { date: '10 Oca', value: 132000, benchmark: 123000 },
    { date: '15 Oca', value: 135800, benchmark: 124800 },
    { date: '20 Oca', value: 138200, benchmark: 126200 },
    { date: '25 Oca', value: 142500, benchmark: 128000 },
    { date: '30 Oca', value: 145800, benchmark: 129500 },
    { date: '04 Şub', value: 148200, benchmark: 131000 },
    { date: '09 Şub', value: 151500, benchmark: 132800 },
    { date: '14 Şub', value: 155000, benchmark: 134500 }
  ];

  const allocationData = [
    { name: 'BTC/TRY', value: 45000, percentage: 29.03 },
    { name: 'ETH/TRY', value: 35000, percentage: 22.58 },
    { name: 'XRP/TRY', value: 25000, percentage: 16.13 },
    { name: 'SOL/TRY', value: 20000, percentage: 12.90 },
    { name: 'ADA/TRY', value: 15000, percentage: 9.68 },
    { name: 'AVAX/TRY', value: 10000, percentage: 6.45 },
    { name: 'Diğer', value: 5000, percentage: 3.23 }
  ];

  const breakdownData = [
    {
      pair: 'BTC/TRY',
      exchange: 'Binance',
      trades: 145,
      winRate: 68,
      profit: 12500.50,
      roi: 8.5
    },
    {
      pair: 'ETH/TRY',
      exchange: 'OKX',
      trades: 132,
      winRate: 65,
      profit: 8750.25,
      roi: 6.2
    },
    {
      pair: 'XRP/TRY',
      exchange: 'Bybit',
      trades: 98,
      winRate: 72,
      profit: 5200.75,
      roi: 4.8
    },
    {
      pair: 'SOL/TRY',
      exchange: 'Gate.io',
      trades: 87,
      winRate: 58,
      profit: 3850.00,
      roi: 3.5
    },
    {
      pair: 'ADA/TRY',
      exchange: 'BTCTURK',
      trades: 76,
      winRate: 62,
      profit: 2100.50,
      roi: 2.8
    },
    {
      pair: 'AVAX/TRY',
      exchange: 'Binance',
      trades: 54,
      winRate: 55,
      profit: 1250.25,
      roi: 1.9
    },
    {
      pair: 'MATIC/TRY',
      exchange: 'OKX',
      trades: 43,
      winRate: 48,
      profit: -850.75,
      roi: -1.2
    },
    {
      pair: 'DOT/TRY',
      exchange: 'Bybit',
      trades: 38,
      winRate: 52,
      profit: 450.00,
      roi: 0.8
    }
  ];

  const metrics = [
    {
      title: 'Toplam Portföy Değeri',
      value: '155.000,00 ₺',
      change: '+24,2% (Son 30 gün)',
      changeType: 'positive',
      icon: 'Wallet',
      description: 'Tüm borsalardaki toplam varlık değeri',
      trend: [45, 52, 48, 58, 62, 68, 72, 78, 85, 92]
    },
    {
      title: 'Gerçekleşmemiş Kar/Zarar',
      value: '+18.250,75 ₺',
      change: '+13,4%',
      changeType: 'positive',
      icon: 'TrendingUp',
      description: 'Açık pozisyonlardan beklenen kazanç'
    },
    {
      title: 'Başarı Oranı',
      value: '64,8%',
      change: '+2,3% (Geçen aya göre)',
      changeType: 'positive',
      icon: 'Target',
      description: 'Karlı işlem yüzdesi'
    },
    {
      title: 'Sharpe Oranı',
      value: '1,85',
      change: 'İyi performans',
      changeType: 'positive',
      icon: 'Activity',
      description: 'Risk-getiri dengesi göstergesi'
    }
  ];

  const handleResetFilters = () => {
    setSelectedExchange('all');
    setSelectedStrategy('all');
    setSelectedTimeframe('30d');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Portföy Analizi
              </h1>
              <p className="text-sm text-muted-foreground">
                Detaylı performans raporlama ve içgörüler
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:bg-accent transition-colors"
              >
                <Icon name="Download" size={18} />
                <span className="text-sm">Rapor İndir</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Icon name="RefreshCw" size={18} />
                <span className="text-sm">Yenile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <FilterControls
            selectedExchange={selectedExchange}
            setSelectedExchange={setSelectedExchange}
            selectedStrategy={selectedStrategy}
            setSelectedStrategy={setSelectedStrategy}
            selectedTimeframe={selectedTimeframe}
            setSelectedTimeframe={setSelectedTimeframe}
            onReset={handleResetFilters}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics?.map((metric, index) => (
            <PerformanceMetricCard 
              key={index} 
              metric={metric}
              title={metric?.title}
              value={metric?.value}
              change={metric?.change}
              changeType={metric?.changeType}
              icon={metric?.icon}
              description={metric?.description}
              trend={metric?.trend}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Performans Trendi
            </h2>
            <div className="h-[400px]">
              <PerformanceChart data={performanceData} title="Performans Trendi" />
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Varlık Dağılımı
            </h2>
            <div className="h-[400px]">
              <AssetAllocationChart data={allocationData} title="Varlık Dağılımı" />
            </div>
          </div>
        </div>

        {/* Real-time P&L Chart */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Canlı Kar/Zarar
          </h2>
          <div className="h-[300px]">
            <RealTimePnLChart />
          </div>
        </div>

        {/* Performance Breakdown Table */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Performans Detayları
          </h2>
          <div className="overflow-x-auto">
            <PerformanceBreakdownTable data={breakdownData} />
          </div>
        </div>

        {/* Additional Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Risk Yönetimi
            </h2>
            <RiskManagementPanel />
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Portföy Yeniden Dengeleme
            </h2>
            <PortfolioRebalancingPanel allocationData={allocationData} />
          </div>
        </div>

        {/* Performance Metrics Panel */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <PerformanceMetricsPanel />
        </div>

        {/* PDF Report Generator */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <PDFReportGenerator />
        </div>

        {/* Export Modal */}
        {isExportModalOpen && (
          <ExportReportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PortfolioAnalytics;