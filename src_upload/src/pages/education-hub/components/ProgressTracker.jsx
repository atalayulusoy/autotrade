import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressTracker = ({ courses }) => {
  const totalLessons = courses?.reduce((sum, course) => sum + course?.lessons, 0);
  const completedLessons = courses?.reduce((sum, course) => sum + course?.completed, 0);
  const overallProgress = (completedLessons / totalLessons) * 100;

  const completedCourses = courses?.filter(c => c?.completed === c?.lessons)?.length;
  const inProgressCourses = courses?.filter(c => c?.completed > 0 && c?.completed < c?.lessons)?.length;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Genel İlerleme</h2>
            <p className="text-slate-400">Tüm kursların toplam tamamlanma oranı</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{overallProgress?.toFixed(0)}%</div>
            <p className="text-sm text-slate-400">{completedLessons}/{totalLessons} ders</p>
          </div>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Icon name="CheckCircle" size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedCourses}</p>
              <p className="text-sm text-slate-400">Tamamlanan Kurs</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Icon name="Clock" size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inProgressCourses}</p>
              <p className="text-sm text-slate-400">Devam Eden Kurs</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Icon name="Award" size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedCourses}</p>
              <p className="text-sm text-slate-400">Kazanılan Sertifika</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Details */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Kurs Detayları</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {courses?.map((course) => {
            const progress = (course?.completed / course?.lessons) * 100;
            return (
              <div key={course?.id} className="p-6 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{course?.title}</h4>
                    <p className="text-sm text-slate-400">
                      {course?.completed}/{course?.lessons} ders tamamlandı
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{progress?.toFixed(0)}%</div>
                    {progress === 100 && (
                      <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                        <Icon name="Award" size={12} />
                        <span>Sertifika</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {progress === 100 && (
                  <button className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Icon name="Download" size={14} />
                    Sertifikayı İndir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Lightbulb" size={24} className="text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Önerilen Sonraki Adım</h3>
        </div>
        <p className="text-slate-300 mb-4">
          İlerlemenize göre "Risk Yönetimi Stratejileri" kursuna devam etmenizi öneriyoruz.
        </p>
        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Kursa Başla
        </button>
      </div>
    </div>
  );
};

export default ProgressTracker;