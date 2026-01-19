import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle, XCircle, Activity } from 'lucide-react';
import Button from '../../../components/ui/Button';

const SignalCard = ({ signal, onExecute, loading }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [executionAmount, setExecutionAmount] = useState(20);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'executed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Activity className="w-4 h-4 animate-pulse" />;
      case 'executed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExecute = () => {
    if (executionAmount > 0) {
      onExecute(signal?.id, executionAmount);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            signal?.signal_type === 'BUY' ?'bg-green-500/10 text-green-400' :'bg-red-500/10 text-red-400'
          }`}>
            {signal?.signal_type === 'BUY' ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{signal?.symbol}</h3>
            <p className="text-slate-400 text-sm">{formatDate(signal?.created_at)}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(signal?.status)}`}>
          {getStatusIcon(signal?.status)}
          <span className="text-sm font-medium capitalize">{signal?.status}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Sinyal Tipi</p>
          <p className={`font-semibold ${
            signal?.signal_type === 'BUY' ? 'text-green-400' : 'text-red-400'
          }`}>
            {signal?.signal_type}
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Fiyat</p>
          <p className="text-white font-semibold">${signal?.price?.toFixed(2)}</p>
        </div>
      </div>
      {signal?.sentiment_score !== undefined && signal?.sentiment_score !== null && (
        <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-xs">Piyasa Duyarlılığı</p>
            <span className={`text-sm font-semibold ${
              signal?.sentiment_score > 30 ? 'text-green-400' :
              signal?.sentiment_score < -30 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {signal?.sentiment_score > 30 ? 'Pozitif' :
               signal?.sentiment_score < -30 ? 'Negatif' : 'Nötr'}
            </span>
          </div>
          <div className="w-full bg-slate-600/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                signal?.sentiment_score > 30 ? 'bg-green-500' :
                signal?.sentiment_score < -30 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(Math.abs(signal?.sentiment_score), 100)}%` }}
            />
          </div>
        </div>
      )}
      {signal?.status === 'pending' && (
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">İşlem Miktarı (USDT)</label>
            <input
              type="number"
              value={executionAmount}
              onChange={(e) => setExecutionAmount(Number(e?.target?.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              min="1"
              step="1"
            />
          </div>
          <Button
            onClick={handleExecute}
            disabled={loading || executionAmount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İşleniyor...' : 'İşlemi Başlat'}
          </Button>
        </div>
      )}
      {signal?.ai_analysis && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          {showDetails ? 'Detayları Gizle' : 'AI Analizi Göster'}
        </button>
      )}
      {showDetails && signal?.ai_analysis && (
        <div className="mt-3 bg-slate-700/30 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-slate-400">Güvenilirlik</p>
              <p className="text-white font-semibold">{signal?.ai_analysis?.reliability_score}/10</p>
            </div>
            <div>
              <p className="text-slate-400">Risk Seviyesi</p>
              <p className="text-white font-semibold">{signal?.ai_analysis?.risk_level}</p>
            </div>
            <div>
              <p className="text-slate-400">Kar Hedefi</p>
              <p className="text-green-400 font-semibold">%{signal?.ai_analysis?.profit_target_percent}</p>
            </div>
            <div>
              <p className="text-slate-400">Stop Loss</p>
              <p className="text-red-400 font-semibold">%{signal?.ai_analysis?.stop_loss_percent}</p>
            </div>
          </div>
          {signal?.ai_analysis?.analysis_summary && (
            <div className="pt-2 border-t border-slate-600">
              <p className="text-slate-400 text-xs mb-1">Analiz Özeti</p>
              <p className="text-white text-sm">{signal?.ai_analysis?.analysis_summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignalCard;