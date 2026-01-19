import React, { useState } from 'react';
import { Send, TrendingUp, FileText } from 'lucide-react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [showSignalForm, setShowSignalForm] = useState(false);
  const [signalData, setSignalData] = useState({
    entryPrice: '',
    targetPrice: '',
    stopLoss: ''
  });

  const handleSend = () => {
    if (!message?.trim()) return;

    if (messageType === 'signal' && showSignalForm) {
      const metadata = {
        signal_type: 'buy',
        entry_price: parseFloat(signalData?.entryPrice) || 0,
        target_price: parseFloat(signalData?.targetPrice) || 0,
        stop_loss: parseFloat(signalData?.stopLoss) || 0
      };
      onSendMessage(message, 'signal', metadata);
      setSignalData({ entryPrice: '', targetPrice: '', stopLoss: '' });
      setShowSignalForm(false);
    } else {
      onSendMessage(message, messageType);
    }

    setMessage('');
    setMessageType('text');
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {/* Message Type Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMessageType('text');
            setShowSignalForm(false);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
            messageType === 'text' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          Mesaj
        </button>
        <button
          onClick={() => {
            setMessageType('signal');
            setShowSignalForm(true);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
            messageType === 'signal' ?'bg-green-500 text-white' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <TrendingUp className="h-3 w-3" />
          Sinyal
        </button>
        <button
          onClick={() => {
            setMessageType('strategy');
            setShowSignalForm(false);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
            messageType === 'strategy' ?'bg-purple-500 text-white' :'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          <FileText className="h-3 w-3" />
          Strateji
        </button>
      </div>
      {/* Signal Form */}
      {showSignalForm && (
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="Giriş Fiyatı"
            value={signalData?.entryPrice}
            onChange={(e) => setSignalData({ ...signalData, entryPrice: e?.target?.value })}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Hedef Fiyat"
            value={signalData?.targetPrice}
            onChange={(e) => setSignalData({ ...signalData, targetPrice: e?.target?.value })}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Stop Loss"
            value={signalData?.stopLoss}
            onChange={(e) => setSignalData({ ...signalData, stopLoss: e?.target?.value })}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}
      {/* Message Input */}
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e?.target?.value)}
          onKeyPress={handleKeyPress}
          placeholder="Mesajınızı yazın..."
          rows={2}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!message?.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;