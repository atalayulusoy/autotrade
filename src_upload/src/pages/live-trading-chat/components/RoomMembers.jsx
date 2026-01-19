import React from 'react';
import { Circle } from 'lucide-react';

const RoomMembers = ({ members }) => {
  if (!members || members?.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm">
        <p>Henüz katılımcı yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {members?.map((member) => (
        <div
          key={member?.id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {member?.userProfile?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <Circle
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${
                member?.isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {member?.userProfile?.fullName || 'Anonim'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {member?.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomMembers;