import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import jsPDF from 'jspdf';


const PDFReportGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily');

  const generateReport = async () => {
    try {
      setLoading(true);

      // Calculate date range based on report type
      const now = new Date();
      let startDate;
      switch (reportType) {
        case 'daily':
          startDate = new Date(now?.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now?.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now?.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now?.getTime() - 24 * 60 * 60 * 1000);
      }

      // Fetch trading data
      const { data: trades, error: tradesError } = await supabase
        ?.from('trading_operations')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.eq('status', 'completed')
        ?.gte('sell_executed_at', startDate?.toISOString())
        ?.order('sell_executed_at', { ascending: false });

      if (tradesError) throw tradesError;

      // Fetch performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        ?.rpc('calculate_performance_metrics', {
          p_user_id: user?.id,
          p_start_date: startDate?.toISOString(),
          p_end_date: now?.toISOString()
        });

      if (metricsError) throw metricsError;

      const metrics = metricsData?.[0] || {};

      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf?.internal?.pageSize?.getWidth();
      const pageHeight = pdf?.internal?.pageSize?.getHeight();

      // Title
      pdf?.setFontSize(20);
      pdf?.setTextColor(37, 99, 235); // Blue
      pdf?.text('Trading Bot Performans Raporu', pageWidth / 2, 20, { align: 'center' });

      // Report period
      pdf?.setFontSize(12);
      pdf?.setTextColor(100, 100, 100);
      const periodText = reportType === 'daily' ? 'Günlük' : reportType === 'weekly' ? 'Haftalık' : 'Aylık';
      pdf?.text(`${periodText} Rapor - ${startDate?.toLocaleDateString('tr-TR')} - ${now?.toLocaleDateString('tr-TR')}`, pageWidth / 2, 30, { align: 'center' });

      // Performance Metrics Section
      pdf?.setFontSize(16);
      pdf?.setTextColor(0, 0, 0);
      pdf?.text('Performans Metrikleri', 20, 45);

      pdf?.setFontSize(11);
      pdf?.setTextColor(60, 60, 60);
      let yPos = 55;

      const metricsToShow = [
        { label: 'Toplam İşlem', value: metrics?.total_trades || 0 },
        { label: 'Kazançlı İşlem', value: metrics?.winning_trades || 0 },
        { label: 'Zararlı İşlem', value: metrics?.losing_trades || 0 },
        { label: 'Kazanç Oranı', value: `${metrics?.win_rate?.toFixed(1) || 0}%` },
        { label: 'Toplam Kar', value: `${metrics?.total_profit?.toFixed(2) || 0} USDT` },
        { label: 'Sharpe Oranı', value: metrics?.sharpe_ratio?.toFixed(2) || '0.00' },
        { label: 'Max Drawdown', value: `${(metrics?.max_drawdown * 100)?.toFixed(1) || 0}%` }
      ];

      metricsToShow?.forEach((metric) => {
        pdf?.text(`${metric?.label}: ${metric?.value}`, 25, yPos);
        yPos += 8;
      });

      // Recent Trades Section
      yPos += 10;
      pdf?.setFontSize(16);
      pdf?.setTextColor(0, 0, 0);
      pdf?.text('Son İşlemler', 20, yPos);
      yPos += 10;

      pdf?.setFontSize(10);
      pdf?.setTextColor(60, 60, 60);

      // Table header
      pdf?.text('Sembol', 25, yPos);
      pdf?.text('Giriş', 60, yPos);
      pdf?.text('Çıkış', 90, yPos);
      pdf?.text('Kar/Zarar', 120, yPos);
      pdf?.text('Tarih', 155, yPos);
      yPos += 8;

      // Trade rows (max 10)
      const maxTrades = Math.min(trades?.length || 0, 10);
      for (let i = 0; i < maxTrades; i++) {
        const trade = trades?.[i];
        pdf?.text(trade?.symbol?.substring(0, 10), 25, yPos);
        pdf?.text(trade?.buy_price?.toFixed(2), 60, yPos);
        pdf?.text(trade?.sell_price?.toFixed(2), 90, yPos);
        
        const profit = parseFloat(trade?.actual_profit || 0);
        pdf?.setTextColor(profit >= 0 ? 34 : 239, profit >= 0 ? 197 : 68, profit >= 0 ? 94 : 68);
        pdf?.text(`${profit?.toFixed(2)} USDT`, 120, yPos);
        
        pdf?.setTextColor(60, 60, 60);
        pdf?.text(new Date(trade?.sell_executed_at)?.toLocaleDateString('tr-TR'), 155, yPos);
        yPos += 7;

        if (yPos > pageHeight - 30) break;
      }

      // Footer
      pdf?.setFontSize(8);
      pdf?.setTextColor(150, 150, 150);
      pdf?.text(`Oluşturulma Tarihi: ${new Date()?.toLocaleString('tr-TR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      const fileName = `trading-report-${reportType}-${now?.toISOString()?.split('T')?.[0]}.pdf`;
      pdf?.save(fileName);

      alert('Rapor başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Rapor oluşturulamadı: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="FileText" size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">PDF Rapor Oluştur</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Rapor Tipi</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'daily', label: 'Günlük' },
              { value: 'weekly', label: 'Haftalık' },
              { value: 'monthly', label: 'Aylık' }
            ]?.map((type) => (
              <button
                key={type?.value}
                onClick={() => setReportType(type?.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  reportType === type?.value
                    ? 'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type?.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={generateReport}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Icon name="Loader" size={16} className="animate-spin" />
              Rapor Oluşturuluyor...
            </>
          ) : (
            <>
              <Icon name="Download" size={16} />
              PDF Rapor İndir
            </>
          )}
        </Button>

        <p className="text-xs text-slate-400 text-center">
          Rapor performans metriklerini ve son işlemleri içerir
        </p>
      </div>
    </div>
  );
};

export default PDFReportGenerator;