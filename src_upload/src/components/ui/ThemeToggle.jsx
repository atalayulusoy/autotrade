import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../AppIcon';

const ThemeToggle = () => {
  const { theme, toggleTheme, loading } = useTheme();

  if (loading) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50 flex items-center justify-center"
      title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
      aria-label={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
    >
      {theme === 'dark' ? (
        <Icon name="Sun" size={18} className="text-yellow-400" />
      ) : (
        <Icon name="Moon" size={18} className="text-blue-400" />
      )}
    </button>
  );
};

export default ThemeToggle;