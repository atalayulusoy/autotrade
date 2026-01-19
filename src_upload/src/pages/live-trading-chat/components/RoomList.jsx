import React from 'react';
import { Hash, Users as UsersIcon, MessageCircle } from 'lucide-react';

const RoomList = ({ rooms, selectedRoom, onRoomSelect }) => {
  const getRoomIcon = (roomType) => {
    switch (roomType) {
      case 'trading_pair':
        return <Hash className="h-4 w-4" />;
      case 'community':
        return <UsersIcon className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {rooms?.map((room) => (
        <button
          key={room?.id}
          onClick={() => onRoomSelect(room)}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            selectedRoom?.id === room?.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted text-foreground'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="mt-1">
                {getRoomIcon(room?.roomType)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {room?.roomName}
                </h3>
                {room?.tradingPair && (
                  <p className="text-xs opacity-80 truncate">
                    {room?.tradingPair}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs opacity-80">
              <span>{room?.activeUsersCount} aktif</span>
              <span>{room?.totalMessagesCount} mesaj</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RoomList;