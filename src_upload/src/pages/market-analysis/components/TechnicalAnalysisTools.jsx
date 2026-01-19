import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TechnicalAnalysisTools = () => {
  const [selectedTool, setSelectedTool] = useState('indicators');

  const tools = [
    { id: 'indicators', label: 'Göstergeler', icon: 'Activity' },
    { id: 'patterns', label: 'Paternler', icon: 'Shapes' },
    { id: 'levels', label: 'D/D Seviyeleri', icon: 'Layers' }
  ];

  const indicators = [
    {
      name: 'RSI (14)',
      value: 68.5,
      signal: 'Aşırı Alım',
      status: 'warning',
      description: 'Göreceli Güç Endeksi olası dönüşü işaret ediyor'
    },
    {
      name: 'MACD',
      value: 'Yükseliş',
      signal: 'Al',
      status: 'success',
      description: 'Hareketli Ortalama Yaklaşım Ayrışım yukarı momentum gösteriyor'
    },
    {
      name: 'Bollinger Bantları',
      value: 'Üst Bant',
      signal: 'Direnç',
      status: 'warning',
      description: 'Fiyat üst volatilite bandına yaklaşıyor'
    },
    {
      name: 'EMA (50)',
      value: 2485000,
      signal: 'Destek',
      status: 'success',
      description: 'Üssel Hareketli Ortalama destek seviyesi olarak hareket ediyor'
    },
    {
      name: 'Stokastik',
      value: 72.3,
      signal: 'Aşırı Alım',
      status: 'warning',
      description: 'Stokastik osilatör aşırı alım bölgesinde'
    },
    {
      name: 'Hacim Profili',
      value: 'Yüksek',
      signal: 'Güçlü',
      status: 'success',
      description: 'İşlem hacmi ortalamanın önemli ölçüde üzerinde'
    }
  ];

  const patterns = [
    {
      name: 'Boğa Bayrağı',
      timeframe: '4S',
      confidence: 85,
      target: 2650000,
      status: 'active'
    },
    {
      name: 'Yükselen Üçgen',
      timeframe: '1G',
      confidence: 78,
      target: 2720000,
      status: 'forming'
    },
    {
      name: 'Çift Dip',
      timeframe: '1H',
      confidence: 92,
      target: 2850000,
      status: 'confirmed'
    }
  ];

  const supportResistance = [
    { type: 'Direnç', level: 2550000, strength: 'Güçlü', touches: 5 },
    { type: 'Direnç', level: 2520000, strength: 'Orta', touches: 3 },
    { type: 'Mevcut', level: 2502000, strength: '-', touches: 0 },
    { type: 'Destek', level: 2480000, strength: 'Orta', touches: 4 },
    { type: 'Destek', level: 2450000, strength: 'Güçlü', touches: 6 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'error':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Güçlü':
        return 'text-success';
      case 'Orta':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="card-mobile">
      <div className="flex-mobile-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-responsive-h2 font-semibold text-foreground mb-1">
            Teknik Analiz Araçları
          </h2>
          <p className="text-sm text-muted-foreground">
            Advanced indicators and pattern recognition
          </p>
        </div>

        <div className="tabs-mobile">
          {tools?.map((tool) => (
            <button
              key={tool?.id}
              onClick={() => setSelectedTool(tool?.id)}
              className={`tab-mobile ${
                selectedTool === tool?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-card hover:text-foreground active:scale-95'
              }`}
            >
              <Icon name={tool?.icon} size={16} />
              {tool?.label}
            </button>
          ))}
        </div>
      </div>
      
      {selectedTool === 'indicators' && (
        <div className="grid-mobile-2">
          {indicators?.map((indicator, index) => (
            <div
              key={index}
              className="card-mobile-compact bg-muted hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{indicator?.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {indicator?.description}
                  </p>
                </div>
                <Icon name="Activity" size={18} className="text-primary flex-shrink-0 ml-2" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    {typeof indicator?.value === 'number' ? indicator?.value?.toLocaleString('tr-TR')
                      : indicator?.value}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      indicator?.status
                    )}`}
                  >
                    {indicator?.signal}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedTool === 'patterns' && (
        <div className="space-mobile">
          {patterns?.map((pattern, index) => (
            <div
              key={index}
              className="card-mobile-compact bg-muted hover:bg-card transition-colors"
            >
              <div className="flex-mobile-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">{pattern?.name}</h3>
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-background">
                      {pattern?.timeframe}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        pattern?.status === 'confirmed' ?'bg-success/10 text-success'
                          : pattern?.status === 'active' ?'bg-primary/10 text-primary' :'bg-warning/10 text-warning'
                      }`}
                    >
                      {pattern?.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 sm:w-24 h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${pattern?.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground">
                          {pattern?.confidence}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Price</p>
                      <p className="text-xs sm:text-sm font-semibold text-success">
                        ₺{pattern?.target?.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="btn-touch-primary flex items-center justify-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                  <Icon name="TrendingUp" size={16} />
                  <span className="text-sm">View Chart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedTool === 'levels' && (
        <div className="space-mobile">
          {supportResistance?.map((level, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 sm:p-4 border transition-colors ${
                level?.type === 'Mevcut' ?'bg-primary/10 border-primary' :'bg-muted border-border hover:bg-card active:bg-card'
              }`}
            >
              <div className="flex-mobile-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="flex items-center gap-2 min-w-[80px] sm:min-w-[100px]">
                    <Icon
                      name={
                        level?.type === 'Direnç' ?'ArrowUp'
                          : level?.type === 'Destek' ?'ArrowDown' :'Minus'
                      }
                      size={16}
                      className={
                        level?.type === 'Direnç' ?'text-error'
                          : level?.type === 'Destek' ?'text-success' :'text-primary'
                      }
                    />
                    <span className="text-xs sm:text-sm font-medium text-foreground">{level?.type}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base sm:text-lg font-semibold text-foreground">
                      ₺{level?.level?.toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-2 md:mt-0">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Strength</p>
                    <p className={`text-xs sm:text-sm font-medium ${getStrengthColor(level?.strength)}`}>
                      {level?.strength}
                    </p>
                  </div>
                  {level?.touches > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Touches</p>
                      <p className="text-xs sm:text-sm font-medium text-foreground">{level?.touches}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicalAnalysisTools;