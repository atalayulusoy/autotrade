import React from 'react';
import { TrendingUp, Image, FileText, Clock } from 'lucide-react';

const MessageList = ({ messages, currentUserId }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'signal':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'chart':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'strategy':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = (message) => {
    if (message?.messageType === 'signal' && message?.metadata) {
      return (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-green-500">Trading Sinyali</span>
          </div>
          <p className="text-sm mb-2">{message?.content}</p>
          {message?.metadata && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              {message?.metadata?.entry_price && (
                <div>
                  <span className="text-muted-foreground">Giriş:</span>
                  <span className="ml-1 font-semibold">{message?.metadata?.entry_price?.toLocaleString('tr-TR')}</span>
                </div>
              )}
              {message?.metadata?.target_price && (
                <div>
                  <span className="text-muted-foreground">Hedef:</span>
                  <span className="ml-1 font-semibold text-green-500">{message?.metadata?.target_price?.toLocaleString('tr-TR')}</span>
                </div>
              )}
              {message?.metadata?.stop_loss && (
                <div>
                  <span className="text-muted-foreground">Stop:</span>
                  <span className="ml-1 font-semibold text-red-500">{message?.metadata?.stop_loss?.toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return <p className="text-sm">{message?.content}</p>;
  };

  if (!messages || messages?.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages?.map((message) => {
        const isOwnMessage = message?.userId === currentUserId;
        
        return (
          <div
            key={message?.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            } rounded-lg p-3`}>
              {!isOwnMessage && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs">
                    {message?.userProfile?.fullName || 'Anonim'}
                  </span>
                  {getMessageIcon(message?.messageType)}
                </div>
              )}
              
              {renderMessageContent(message)}
              
              <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                <Clock className="h-3 w-3" />
                <span>{formatTime(message?.createdAt)}</span>
                {message?.isEdited && <span className="ml-1">(düzenlendi)</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;