import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const ThemeContext = React.createContext();

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => {
    // Check localStorage first for immediate theme application
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  const [loading, setLoading] = useState(true);

  // Apply theme immediately on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    loadThemePreference();
  }, [user]);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList?.add('dark');
      root.classList?.remove('light');
    } else {
      root.classList?.add('light');
      root.classList?.remove('dark');
    }
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  const loadThemePreference = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        ?.from('theme_preferences')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.single();

      if (error && error?.code !== 'PGRST116') {
        console.error('Error loading theme:', error);
      }

      if (data) {
        const savedTheme = data?.theme_mode || 'dark';
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Create default theme preference
        await supabase
          ?.from('theme_preferences')
          ?.insert({ user_id: user?.id, theme_mode: theme });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);

    if (user) {
      try {
        await supabase
          ?.from('theme_preferences')
          ?.upsert({ 
            user_id: user?.id, 
            theme_mode: newTheme, 
            updated_at: new Date()?.toISOString() 
          }, {
            onConflict: 'user_id'
          });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const value = {
    theme,
    toggleTheme,
    loading,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;