import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import jsPDF from 'jspdf';

const PLExportModal = ({ isOpen, onClose, plData, viewMode, selectedYear, selectedMonth }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [includeTaxInfo, setIncludeTaxInfo] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      if (exportFormat === 'pdf') {
        await generatePDF();
      } else {
        await generateExcel();
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Rapor oluşturulamadı: ' + error?.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf?.internal?.pageSize?.getWidth();
    let yPos = 20;

    // Title
    pdf?.setFontSize(20);
    pdf?.setTextColor(37, 99, 235);
    pdf?.text('Kar/Zarar Raporu', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Period
    pdf?.setFontSize(12);
    pdf?.setTextColor(100, 100, 100);
    const periodText = viewMode === 'monthly'
      ? `${selectedMonth}/${selectedYear}`
      : `${selectedYear}`;
    pdf?.text(`Dönem: ${periodText}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Metrics
    pdf?.setFontSize(16);
    pdf?.setTextColor(0, 0, 0);
    pdf?.text('Özet Bilgiler', 20, yPos);
    yPos += 10;

    pdf?.setFontSize(11);
    pdf?.setTextColor(60, 60, 60);
    pdf?.text(`Toplam Kar/Zarar: ${plData?.totalProfit?.toFixed(2) || '0.00'} USDT`, 25, yPos);
    yPos += 7;
    pdf?.text(`Gerçekleşen Kazanç: ${plData?.realizedGains?.toFixed(2) || '0.00'} USDT`, 25, yPos);
    yPos += 7;
    pdf?.text(`Toplam Komisyon: ${plData?.totalFees?.toFixed(2) || '0.00'} USDT`, 25, yPos);
    yPos += 7;
    pdf?.text(`Kazanma Oranı: ${plData?.winRate?.toFixed(1) || '0.0'}%`, 25, yPos);
    yPos += 15;

    // Tax Information
    if (includeTaxInfo) {
      pdf?.setFontSize(16);
      pdf?.setTextColor(0, 0, 0);
      pdf?.text('Vergi Bilgileri', 20, yPos);
      yPos += 10;

      pdf?.setFontSize(11);
      pdf?.setTextColor(60, 60, 60);
      pdf?.text('Türkiye Gelir Vergisi Kanunu uyarınca kripto para kazançları', 25, yPos);
      yPos += 7;
      pdf?.text('diğer kazanç ve iratlar kapsamında değerlendirilir.', 25, yPos);
      yPos += 7;
      pdf?.text(`Beyan edilecek tutar: ${plData?.totalProfit?.toFixed(2) || '0.00'} USDT`, 25, yPos);
      yPos += 15;
    }

    // Transactions
    if (includeTransactions && plData?.transactions?.length > 0) {
      pdf?.setFontSize(16);
      pdf?.setTextColor(0, 0, 0);
      pdf?.text('İşlem Detayları', 20, yPos);
      yPos += 10;

      pdf?.setFontSize(9);
      pdf?.text('Tarih', 25, yPos);
      pdf?.text('Sembol', 55, yPos);
      pdf?.text('Alış', 85, yPos);
      pdf?.text('Satış', 110, yPos);
      pdf?.text('Kar/Zarar', 140, yPos);
      yPos += 7;

      const maxTransactions = Math.min(plData?.transactions?.length, 15);
      for (let i = 0; i < maxTransactions; i++) {
        const tx = plData?.transactions?.[i];
        pdf?.setTextColor(60, 60, 60);
        pdf?.text(tx?.date?.substring(0, 10), 25, yPos);
        pdf?.text(tx?.symbol?.substring(0, 8), 55, yPos);
        pdf?.text(tx?.buyPrice?.toFixed(2), 85, yPos);
        pdf?.text(tx?.sellPrice?.toFixed(2), 110, yPos);
        
        const profit = tx?.profit || 0;
        pdf?.setTextColor(profit >= 0 ? 34 : 239, profit >= 0 ? 197 : 68, profit >= 0 ? 94 : 68);
        pdf?.text(`${profit?.toFixed(2)} USDT`, 140, yPos);
        yPos += 6;

        if (yPos > 270) break;
      }
    }

    // Footer
    pdf?.setFontSize(8);
    pdf?.setTextColor(150, 150, 150);
    pdf?.text(
      `Oluşturulma: ${new Date()?.toLocaleString('tr-TR')}`,
      pageWidth / 2,
      pdf?.internal?.pageSize?.getHeight() - 10,
      { align: 'center' }
    );

    const fileName = `kar-zarar-raporu-${viewMode}-${selectedYear}${viewMode === 'monthly' ? `-${selectedMonth}` : ''}.pdf`;
    pdf?.save(fileName);
  };

  const generateExcel = async () => {
    // Simple CSV export (Excel alternative)
    let csv = 'Tarih,Sembol,Borsa,Alış Fiyatı,Satış Fiyatı,Miktar,Kar/Zarar,ROI\n';
    
    plData?.transactions?.forEach((tx) => {
      csv += `${tx?.date},${tx?.symbol},${tx?.exchange},${tx?.buyPrice},${tx?.sellPrice},${tx?.quantity},${tx?.profit},${tx?.roi}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', `kar-zarar-raporu-${viewMode}-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl"
        onClick={(e) => e?.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Rapor Dışa Aktar</h3>
            <p className="text-sm text-slate-400 mt-1">
              Detaylı finansal rapor oluştur
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Icon name="X" size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Dosya Formatı</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  exportFormat === 'pdf' ?'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon name="FileText" size={16} className="inline mr-1" />
                PDF
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  exportFormat === 'excel' ?'bg-blue-500 text-white' :'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon name="FileSpreadsheet" size={16} className="inline mr-1" />
                Excel
              </button>
            </div>
          </div>

          {/* Content Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-400">Rapor İçeriği</p>
            
            <Checkbox
              label="Grafikleri dahil et"
              description="Performans görselleştirmeleri"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e?.target?.checked)}
            />

            <Checkbox
              label="İşlem detaylarını dahil et"
              description="Tüm alım-satım işlemleri"
              checked={includeTransactions}
              onChange={(e) => setIncludeTransactions(e?.target?.checked)}
            />

            <Checkbox
              label="Vergi bilgilerini dahil et"
              description="Türkiye vergi mevzuatı bilgileri"
              checked={includeTaxInfo}
              onChange={(e) => setIncludeTaxInfo(e?.target?.checked)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-slate-700/50 text-slate-300 hover:bg-slate-700"
          >
            İptal
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <Icon name="Loader" size={16} className="animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Icon name="Download" size={16} />
                Raporu İndir
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PLExportModal;