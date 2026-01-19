import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WebinarSchedule = ({ webinars }) => {
  const [registeredWebinars, setRegisteredWebinars] = useState(
    webinars?.filter(w => w?.registered)?.map(w => w?.id) || []
  );

  const handleRegister = (webinarId) => {
    setRegisteredWebinars(prev => {
      if (prev?.includes(webinarId)) {
        return prev?.filter(id => id !== webinarId);
      } else {
        return [...prev, webinarId];
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Video" size={24} className="text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Canlı Webinarlar</h2>
        </div>
        <p className="text-slate-400">
          Uzmanlardan canlı eğitimler, soru-cevap oturumları ve piyasa analizleri
        </p>
      </div>

      {/* Upcoming Webinars */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Yaklaşan Webinarlar</h3>
        {webinars?.map((webinar) => {
          const isRegistered = registeredWebinars?.includes(webinar?.id);
          return (
            <div
              key={webinar?.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Thumbnail */}
                <div className="relative h-48 md:h-auto">
                  <img
                    src={webinar?.thumbnail}
                    alt={webinar?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  {isRegistered && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} />
                      Kayıtlı
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-2 p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {webinar?.title}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      <span>{webinar?.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      <span>{formatDate(webinar?.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      <span>{webinar?.time} • {webinar?.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRegister(webinar?.id)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isRegistered
                          ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' :'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isRegistered ? 'Kaydı İptal Et' : 'Kayıt Ol'}
                    </button>
                    {isRegistered && (
                      <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                        <Icon name="Calendar" size={16} />
                        Takvime Ekle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Webinar Archive */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Webinar Arşivi</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Tümünü Görüntüle
          </button>
        </div>
        <p className="text-slate-400 text-sm">
          Geçmiş webinarların kayıtlarına erişin, aranabilir transkriptler ve indirilebilir kaynaklar.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="PlayCircle" size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Alt Coin Stratejileri</p>
                <p className="text-xs text-slate-400">10 Ocak 2026</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="PlayCircle" size={24} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Teknik Analiz İpuçları</p>
                <p className="text-xs text-slate-400">5 Ocak 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebinarSchedule;