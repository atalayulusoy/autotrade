import React from 'react';
import Icon from '../../../components/AppIcon';

const VideoTutorial = ({ exchange }) => {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`bg-gradient-to-br ${exchange?.color} p-2 rounded-lg`}>
          <Icon name={exchange?.icon} size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">{exchange?.name} API Anahtarı Alma</h3>
      </div>

      {/* Video Player */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={exchange?.videoUrl}
          title={`${exchange?.name} API Tutorial`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Icon name="List" size={16} />
          Adım Adım Talimatlar
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
          <li>{exchange?.name} hesabınıza giriş yapın</li>
          <li>Profil menüsünden "API Management" bölümüne gidin</li>
          <li>"Create API" butonuna tıklayın</li>
          <li>API anahtarına bir isim verin (örn: "TradingBot")</li>
          <li>"Spot Trading" iznini aktif edin</li>
          <li>IP kısıtlaması bölümünü boş bırakın veya sunucu IP'sini ekleyin</li>
          <li>"Create" butonuna tıklayın</li>
          <li>API Key ve API Secret'ı güvenli bir yere kaydedin</li>
        </ol>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://${exchange?.id?.toLowerCase()}.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Icon name="ExternalLink" size={14} />
          {exchange?.name} Sitesine Git
        </a>
        <a
          href={`https://${exchange?.id?.toLowerCase()}.com/api-docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Icon name="Book" size={14} />
          API Dokümantasyonu
        </a>
      </div>
    </div>
  );
};

export default VideoTutorial;