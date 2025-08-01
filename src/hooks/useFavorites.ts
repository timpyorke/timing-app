import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('menuOrderFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('menuOrderFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (menuId: string) => {
    setFavorites(prev => {
      if (!prev.includes(menuId)) {
        return [...prev, menuId];
      }
      return prev;
    });
  };

  const removeFavorite = (menuId: string) => {
    setFavorites(prev => prev.filter(id => id !== menuId));
  };

  const toggleFavorite = (menuId: string) => {
    if (favorites.includes(menuId)) {
      removeFavorite(menuId);
    } else {
      addFavorite(menuId);
    }
  };

  const isFavorite = (menuId: string) => {
    return favorites.includes(menuId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};