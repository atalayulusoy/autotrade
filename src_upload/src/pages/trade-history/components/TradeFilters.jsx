import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';


const TradeFilters = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  onExport 
}) => {
  const exchangeOptions = [
    { value: 'all', label: 'Tüm Borsalar' },
    { value: 'okx', label: 'OKX' },
    { value: 'binance', label: 'Binance' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'gateio', label: 'Gate.io' },
    { value: 'btcturk', label: 'BTCTURK' }
  ];

  const tradingPairOptions = [
    { value: 'all', label: 'Tüm Pariteler' },
    { value: 'BTC/TRY', label: 'BTC/TRY' },
    { value: 'ETH/TRY', label: 'ETH/TRY' },
    { value: 'XRP/TRY', label: 'XRP/TRY' },
    { value: 'ADA/TRY', label: 'ADA/TRY' },
    { value: 'SOL/TRY', label: 'SOL/TRY' },
    { value: 'AVAX/TRY', label: 'AVAX/TRY' },
    { value: 'DOGE/TRY', label: 'DOGE/TRY' },
    { value: 'MATIC/TRY', label: 'MATIC/TRY' }
  ];

  const tradeTypeOptions = [
    { value: 'all', label: 'Tüm İşlemler' },
    { value: 'buy', label: 'Alış' },
    { value: 'sell', label: 'Satış' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Filtreler</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            Sıfırla
          </Button>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            className="w-full sm:w-auto"
          >
            CSV İndir
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="date"
          label="Başlangıç Tarihi"
          value={filters?.startDate}
          onChange={(e) => onFilterChange('startDate', e?.target?.value)}
        />

        <Input
          type="date"
          label="Bitiş Tarihi"
          value={filters?.endDate}
          onChange={(e) => onFilterChange('endDate', e?.target?.value)}
        />

        <Select
          label="Borsa"
          options={exchangeOptions}
          value={filters?.exchange}
          onChange={(value) => onFilterChange('exchange', value)}
        />

        <Select
          label="Parite"
          options={tradingPairOptions}
          value={filters?.tradingPair}
          onChange={(value) => onFilterChange('tradingPair', value)}
          searchable
        />

        <Select
          label="İşlem Tipi"
          options={tradeTypeOptions}
          value={filters?.tradeType}
          onChange={(value) => onFilterChange('tradeType', value)}
        />

        <Input
          type="number"
          label="Min Kar/Zarar (₺)"
          placeholder="Minimum"
          value={filters?.minProfit}
          onChange={(e) => onFilterChange('minProfit', e?.target?.value)}
        />

        <Input
          type="number"
          label="Max Kar/Zarar (₺)"
          placeholder="Maximum"
          value={filters?.maxProfit}
          onChange={(e) => onFilterChange('maxProfit', e?.target?.value)}
        />

        <Input
          type="text"
          label="İşlem ID Ara"
          placeholder="İşlem ID girin"
          value={filters?.searchId}
          onChange={(e) => onFilterChange('searchId', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default TradeFilters;