import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const VideoPlayer = ({ course, onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState(course?.videos?.[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <Icon name="ArrowLeft" size={20} />
        <span>Kurslara Dön</span>
      </button>

      {/* Course Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-2">{course?.title}</h2>
        <p className="text-slate-400">{course?.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Container */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="PlayCircle" size={64} className="text-blue-400 mx-auto mb-4" />
                  <p className="text-white font-medium">{selectedVideo?.title}</p>
                  <p className="text-slate-400 text-sm mt-2">Video oynatıcı yazılımı entegrasyonu</p>
                  <p className="text-slate-500 text-xs mt-1">Türkçe altyazı desteği</p>
                </div>
              </div>
            </div>

            {/* Video Controls */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Icon name="Play" size={16} className="text-white" />
                  </button>
                  <span className="text-sm text-slate-400">0:00 / {selectedVideo?.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e?.target?.value))}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1 text-sm text-white"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                  <button className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                    <Icon name="Settings" size={16} className="text-slate-300" />
                  </button>
                  <button className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">
                    <Icon name="Maximize" size={16} className="text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-blue-400" />
                <span className="font-medium text-white">Notlarım</span>
              </div>
              <Icon
                name={showNotes ? 'ChevronUp' : 'ChevronDown'}
                size={20}
                className="text-slate-400"
              />
            </button>
            {showNotes && (
              <div className="p-4 border-t border-slate-700/50">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e?.target?.value)}
                  placeholder="Video hakkında notlarınızı buraya yazın..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[120px]"
                />
                <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Notu Kaydet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <h3 className="font-semibold text-white">Ders İçeriği</h3>
              <p className="text-sm text-slate-400 mt-1">
                {course?.lessons} ders • {course?.duration}
              </p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {course?.videos?.map((video, index) => (
                <button
                  key={video?.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`w-full p-4 text-left border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                    selectedVideo?.id === video?.id ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      video?.completed
                        ? 'bg-green-500/10 border border-green-500/20' :'bg-slate-700/50 border border-slate-600'
                    }`}>
                      {video?.completed ? (
                        <Icon name="CheckCircle" size={16} className="text-green-400" />
                      ) : (
                        <span className="text-xs text-slate-400">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-1">{video?.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Icon name="Clock" size={12} />
                        <span>{video?.duration}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;