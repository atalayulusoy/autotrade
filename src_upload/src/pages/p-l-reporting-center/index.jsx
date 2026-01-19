import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import PLChart from './components/PLChart';
import PLFilterPanel from './components/PLFilterPanel';
import PLDetailTable from './components/PLDetailTable';
import PLExportModal from './components/PLExportModal';
import PLMetricsCards from './components/PLMetricsCards';
import useNavigation from '../../hooks/useNavigation';

const PLReportingCenter = () => {
  const { user } = useAuth();
  const { isMobile } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('monthly'); // monthly, yearly
  const [selectedYear, setSelectedYear] = useState(new Date()?.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date()?.getMonth() + 1);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [filters, setFilters] = useState({
    exchange: 'all',
    tradingPair: 'all',
    strategyType: 'all'
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [plData, setPLData] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (user) {
      loadPLData();
    }
  }, [user, viewMode, selectedYear, selectedMonth, filters]);

  const loadPLData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on view mode
      let startDate, endDate;
      if (viewMode === 'monthly') {
        startDate = new Date(selectedYear, selectedMonth - 1, 1);
        endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
      } else {
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
      }

      // Fetch trading operations
      let query = supabase?.from('trading_operations')?.select('*')?.eq('user_id', user?.id)?.eq('status', 'completed')?.gte('sell_executed_at', startDate?.toISOString())?.lte('sell_executed_at', endDate?.toISOString());

      if (filters?.exchange !== 'all') {
        query = query?.eq('exchange', filters?.exchange);
      }
      if (filters?.tradingPair !== 'all') {
        query = query?.eq('symbol', filters?.tradingPair);
      }

      const { data: trades, error } = await query?.order('sell_executed_at', { ascending: true });

      if (error) throw error;

      // Process data for charts and metrics
      const processedData = processPLData(trades || [], viewMode);
      setPLData(processedData);
      setChartData(processedData?.chartData || []);
    } catch (error) {
      console.error('Error loading P&L data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPLData = (trades, mode) => {
    if (!trades || trades?.length === 0) {
      return {
        totalProfit: 0,
        realizedGains: 0,
        totalFees: 0,
        winRate: 0,
        chartData: [],
        transactions: []
      };
    }

    let cumulativeProfit = 0;
    const chartData = [];
    const transactions = [];

    trades?.forEach((trade) => {
      const profit = parseFloat(trade?.actual_profit || 0);
      const fee = parseFloat(trade?.total_fees || 0);
      cumulativeProfit += profit;

      const date = new Date(trade?.sell_executed_at);
      const dateKey = mode === 'monthly' ? date?.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
        : date?.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });

      chartData?.push({
        date: dateKey,
        profit: parseFloat(cumulativeProfit?.toFixed(2)),
        trade: profit
      });

      transactions?.push({
        id: trade?.id,
        date: date?.toLocaleDateString('tr-TR'),
        symbol: trade?.symbol,
        exchange: trade?.exchange,
        buyPrice: parseFloat(trade?.buy_price),
        sellPrice: parseFloat(trade?.sell_price),
        quantity: parseFloat(trade?.quantity),
        profit: profit,
        fee: fee,
        roi: ((profit / (parseFloat(trade?.buy_price) * parseFloat(trade?.quantity))) * 100)?.toFixed(2)
      });
    });

    const totalProfit = trades?.reduce((sum, t) => sum + parseFloat(t?.actual_profit || 0), 0);
    const totalFees = trades?.reduce((sum, t) => sum + parseFloat(t?.total_fees || 0), 0);
    const winningTrades = trades?.filter(t => parseFloat(t?.actual_profit || 0) > 0)?.length;
    const winRate = (winningTrades / trades?.length) * 100;

    return {
      totalProfit,
      realizedGains: totalProfit + totalFees,
      totalFees,
      winRate,
      chartData,
      transactions
    };
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
              Kar/Zarar Raporu
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Aylık ve yıllık performans analizi
            </p>
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="btn-touch-primary flex items-center gap-2"
          >
            <Icon name="Download" size={18} />
            <span className="text-sm font-medium">Rapor İndir</span>
          </button>
        </div>

        <PLFilterPanel
          viewMode={viewMode}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <PLMetricsCards data={plData} />

        <div className="card-mobile">
          <PLChart data={plData} period={selectedPeriod} viewMode={viewMode} />
        </div>

        <div className="card-mobile">
          <PLDetailTable data={plData} transactions={plData?.transactions || []} />
        </div>

        <PLExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          data={plData}
          period={selectedPeriod}
          viewMode={viewMode}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </div>
    </MainLayout>
  );
};

export default PLReportingCenter;