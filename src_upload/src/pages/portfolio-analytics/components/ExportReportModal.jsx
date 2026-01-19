import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportReportModal = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState('1M');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [includeTransactions, setIncludeTransactions] = useState(false);

  const reportTypes = [
    { value: 'comprehensive', label: 'Kapsamlı Rapor' },
    { value: 'summary', label: 'Özet Rapor' },
    { value: 'performance', label: 'Performans Raporu' },
    { value: 'tax', label: 'Vergi Raporu' }
  ];

  const dateRanges = [
    { value: '1W', label: 'Son 1 Hafta' },
    { value: '1M', label: 'Son 1 Ay' },
    { value: '3M', label: 'Son 3 Ay' },
    { value: '6M', label: 'Son 6 Ay' },
    { value: '1Y', label: 'Son 1 Yıl' },
    { value: 'custom', label: 'Özel Tarih Aralığı' }
  ];

  const handleExport = () => {
    console.log('Exporting report:', {
      reportType,
      dateRange,
      includeCharts,
      includeBreakdown,
      includeTransactions
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg border border-border w-full max-w-md shadow-lg"
        onClick={(e) => e?.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Rapor Dışa Aktar</h3>
            <p className="caption text-muted-foreground mt-1">
              PDF formatında detaylı rapor oluşturun
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            aria-label="Kapat"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Select
            label="Rapor Türü"
            options={reportTypes}
            value={reportType}
            onChange={setReportType}
          />

          <Select
            label="Tarih Aralığı"
            options={dateRanges}
            value={dateRange}
            onChange={setDateRange}
          />

          <div className="space-y-3">
            <p className="caption font-medium text-foreground">Rapor İçeriği</p>
            
            <Checkbox
              label="Grafikleri dahil et"
              description="Performans ve dağılım grafikleri"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e?.target?.checked)}
            />

            <Checkbox
              label="Detaylı dağılım tablosu"
              description="İşlem çifti bazında analiz"
              checked={includeBreakdown}
              onChange={(e) => setIncludeBreakdown(e?.target?.checked)}
            />

            <Checkbox
              label="İşlem geçmişi"
              description="Tüm alım-satım işlemleri"
              checked={includeTransactions}
              onChange={(e) => setIncludeTransactions(e?.target?.checked)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            İptal
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={handleExport}
          >
            Raporu İndir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;