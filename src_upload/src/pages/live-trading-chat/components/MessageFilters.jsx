import React from 'react';
import { MessageCircle, TrendingUp, Image, FileText } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const MessageFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Tümü', icon: MessageCircle },
    { id: 'signals', label: 'Sinyaller', icon: TrendingUp },
    { id: 'charts', label: 'Grafikler', icon: Image },
    { id: 'strategies', label: 'Stratejiler', icon: FileText }
  ];

  return (
    <div className="flex gap-2">
      {filters?.map((filter) => {
        const Icon = filter?.icon;
        return (
          <button
            key={filter?.id}
            onClick={() => onFilterChange(filter?.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              activeFilter === filter?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <Icon className="h-3 w-3" />
            {filter?.label}
          </button>
        );
      })}
    </div>
  );
};

export default MessageFilters;