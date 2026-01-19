import React from 'react';
import Icon from '../../../components/AppIcon';

const CourseCard = ({ course, onSelect, getDifficultyColor }) => {
  const progressPercentage = (course?.completed / course?.lessons) * 100;

  return (
    <div
      onClick={onSelect}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course?.thumbnail}
          alt={course?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
            getDifficultyColor(course?.difficulty)
          }`}>
            {course?.difficulty}
          </span>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Icon name="Clock" size={12} className="text-slate-300" />
            <span className="text-xs text-slate-300">{course?.duration}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {course?.title}
        </h3>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {course?.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Icon name="BookOpen" size={14} />
            <span>{course?.lessons} ders</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="CheckCircle" size={14} className="text-green-400" />
            <span>{course?.completed} tamamlandı</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">İlerleme</span>
            <span className="text-white font-medium">{progressPercentage?.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Icon name="Play" size={16} />
          {course?.completed > 0 ? 'Devam Et' : 'Başla'}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;