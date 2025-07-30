import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('drinkOrderFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('drinkOrderFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (drinkId: string) => {
    setFavorites(prev => {
      if (!prev.includes(drinkId)) {
        return [...prev, drinkId];
      }
      return prev;
    });
  };

  const removeFavorite = (drinkId: string) => {
    setFavorites(prev => prev.filter(id => id !== drinkId));
  };

  const toggleFavorite = (drinkId: string) => {
    if (favorites.includes(drinkId)) {
      removeFavorite(drinkId);
    } else {
      addFavorite(drinkId);
    }
  };

  const isFavorite = (drinkId: string) => {
    return favorites.includes(drinkId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
};