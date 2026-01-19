import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterControls = ({ 
  selectedExchange, 
  setSelectedExchange,
  selectedStrategy,
  setSelectedStrategy,
  onReset 
}) => {
  const exchanges = [
    { value: 'all', label: 'Tüm Borsalar' },
    { value: 'binance', label: 'Binance' },
    { value: 'okx', label: 'OKX' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'gateio', label: 'Gate.io' },
    { value: 'btcturk', label: 'BTCTURK' }
  ];

  const strategies = [
    { value: 'all', label: 'Tüm Stratejiler' },
    { value: 'scalping', label: 'Scalping' },
    { value: 'swing', label: 'Swing Trading' },
    { value: 'trend', label: 'Trend Following' },
    { value: 'arbitrage', label: 'Arbitraj' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Borsa Filtresi"
            options={exchanges}
            value={selectedExchange}
            onChange={setSelectedExchange}
          />

          <Select
            label="Strateji Filtresi"
            options={strategies}
            value={selectedStrategy}
            onChange={setSelectedStrategy}
          />
        </div>

        <Button
          variant="outline"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={onReset}
        >
          Sıfırla
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;