import React from 'react';
import Icon from '../../../components/AppIcon';

const AuditLog = ({ logs }) => {
  const getActionIcon = (actionType) => {
    if (actionType === 'api_key_approved') return 'CheckCircle';
    if (actionType === 'api_key_rejected') return 'XCircle';
    return 'Activity';
  };

  const getActionColor = (actionType) => {
    if (actionType === 'api_key_approved') return 'text-green-400';
    if (actionType === 'api_key_rejected') return 'text-red-400';
    return 'text-blue-400';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon name="History" size={20} />
        Denetim Günlüğü
      </h2>

      {logs?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Henüz denetim kaydı yok</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs?.map((log) => (
            <div key={log?.id} className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Icon
                  name={getActionIcon(log?.action_type)}
                  size={16}
                  className={`mt-0.5 ${getActionColor(log?.action_type)}`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">
                      {log?.action_description}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(log?.created_at)?.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  {log?.metadata?.notes && (
                    <p className="text-xs text-slate-400 mt-1">
                      Not: {log?.metadata?.notes}
                    </p>
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

export default AuditLog;