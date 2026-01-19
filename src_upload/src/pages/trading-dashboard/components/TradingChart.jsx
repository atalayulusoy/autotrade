import React from 'react';
import CandlestickChart from './CandlestickChart';

const TradingChart = ({ selectedCoin, timeframe, setTimeframe, indicators, toggleIndicator, availableIndicators, timeframes }) => {
  return (
    <CandlestickChart 
      selectedCoin={selectedCoin} 
      timeframe={timeframe}
      setTimeframe={setTimeframe}
      indicators={indicators}
      toggleIndicator={toggleIndicator}
      availableIndicators={availableIndicators}
      timeframes={timeframes}
    />
  );
};

export default TradingChart;