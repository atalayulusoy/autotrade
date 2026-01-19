import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PriceComparisonTable = ({ exchanges, tradingPairs, opportunities }) => {
  const [priceData, setPriceData] = useState({});

  useEffect(() => {
    generatePriceData();
  }, [tradingPairs, opportunities]);

  const generatePriceData = () => {
    const data = {};
    tradingPairs?.forEach(pair => {
      data[pair] = {};
      const basePrice = Math.random() * 50000 + 1000;
      exchanges?.forEach(exchange => {
        const variance = (Math.random() - 0.5) * 0.02;
        data[pair][exchange] = {
          price: basePrice * (1 + variance),
          change24h: (Math.random() - 0.5) * 10
        };
      });
    });
    setPriceData(data);
  };

  const getHighestPrice = (pair) => {
    const prices = exchanges?.map(ex => priceData?.[pair]?.[ex]?.price || 0);
    return Math.max(...prices);
  };

  const getLowestPrice = (pair) => {
    const prices = exchanges?.map(ex => priceData?.[pair]?.[ex]?.price || 0);
    return Math.min(...prices);
  };

  const getSpreadPercentage = (pair) => {
    const highest = getHighestPrice(pair);
    const lowest = getLowestPrice(pair);
    return ((highest - lowest) / lowest * 100)?.toFixed(2);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground">İşlem Çifti</th>
              {exchanges?.map(exchange => (
                <th key={exchange} className="px-4 py-3 text-center text-sm font-medium text-foreground">
                  {exchange}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Spread</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tradingPairs?.map(pair => {
              const highest = getHighestPrice(pair);
              const lowest = getLowestPrice(pair);
              const spread = getSpreadPercentage(pair);
              
              return (
                <tr key={pair} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{pair}</div>
                  </td>
                  {exchanges?.map(exchange => {
                    const data = priceData?.[pair]?.[exchange];
                    const isHighest = data?.price === highest;
                    const isLowest = data?.price === lowest;
                    
                    return (
                      <td key={exchange} className="px-4 py-3 text-center">
                        <div className={`font-mono text-sm ${
                          isHighest ? 'text-error font-bold' : isLowest ?'text-success font-bold': 'text-foreground'
                        }`}>
                          ${data?.price?.toFixed(2)}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {data?.change24h > 0 ? (
                            <TrendingUp size={12} className="text-success" />
                          ) : data?.change24h < 0 ? (
                            <TrendingDown size={12} className="text-error" />
                          ) : (
                            <Minus size={12} className="text-muted-foreground" />
                          )}
                          <span className={`text-xs ${
                            data?.change24h > 0 ? 'text-success' :
                            data?.change24h < 0 ? 'text-error': 'text-muted-foreground'
                          }`}>
                            {data?.change24h?.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <div className={`font-bold ${
                      parseFloat(spread) >= 2 ? 'text-success' :
                      parseFloat(spread) >= 1 ? 'text-yellow-500': 'text-muted-foreground'
                    }`}>
                      {spread}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ${(highest - lowest)?.toFixed(2)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-muted border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span>En Düşük Fiyat (Al)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error rounded"></div>
            <span>En Yüksek Fiyat (Sat)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonTable;