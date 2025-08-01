import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Plus } from 'lucide-react';
import { useTranslation } from '../i18n/stub';
import { Drink, DrinkCategory, CartItem } from '../types';
import { apiService } from '../services/api';
import { formatPrice, debounce, generateId } from '../utils';
import { useCart } from '../context/CartContext';

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addItem, toggleCart } = useCart();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [categories, setCategories] = useState<DrinkCategory[]>([]);
  const [filteredDrinks, setFilteredDrinks] = useState<Drink[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuData = await apiService.getMenu();
        setDrinks(menuData.drinks);
        setCategories(menuData.categories);
        setFilteredDrinks(menuData.drinks);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const debouncedSearch = debounce((query: string, category: string) => {
    let filtered = drinks;

    if (category !== 'all') {
      filtered = filtered.filter(drink => drink.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter(drink =>
        drink.name.toLowerCase().includes(query.toLowerCase()) ||
        drink.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredDrinks(filtered);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, drinks]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleDrinkClick = (drinkId: string) => {
    navigate(`/drink/${drinkId}`);
  };

  const handleQuickAddToCart = (e: React.MouseEvent, drink: Drink) => {
    e.stopPropagation(); // Prevent navigating to drink details
    
    // Use default options for quick add
    const defaultSize = drink.sizes[0];
    const defaultMilk = drink.milkOptions[0];
    const defaultSweetness = drink.sweetnessLevels[0];
    const defaultTemperature = drink.temperatureOptions.includes('Iced') ? 'Iced' : drink.temperatureOptions[0];
    
    const cartItem: CartItem = {
      id: generateId(),
      drinkId: drink.id,
      drinkName: drink.name,
      drinkImage: drink.image,
      size: defaultSize,
      milk: defaultMilk,
      sweetness: defaultSweetness,
      temperature: defaultTemperature,
      addOns: [],
      quantity: 1,
      totalPrice: drink.basePrice + defaultSize.priceModifier,
    };

    addItem(cartItem);
    
    // Show success feedback
    const button = e.currentTarget as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = t('menu.added');
    button.disabled = true;
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 1500);
    
    // Open cart drawer to show the added item
    setTimeout(() => {
      toggleCart();
    }, 800);
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" size={20} />
        <input
          type="text"
          placeholder={t('menu.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered input-touch w-full pl-10"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 px-1">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`btn btn-sm whitespace-nowrap px-4 py-2 ${
            selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'
          }`}
        >
          {t('menu.all')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`btn btn-sm whitespace-nowrap px-4 py-2 ${
              selectedCategory === category.id ? 'btn-primary' : 'btn-outline'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filteredDrinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/60">{t('menu.noResults')}</p>
          <p className="text-sm text-base-content/40 mt-1">
            {t('menu.noResultsSubtext')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrinks.map((drink) => (
            <div
              key={drink.id}
              onClick={() => handleDrinkClick(drink.id)}
              className="card-drink group cursor-pointer hover:shadow-xl transition-all duration-200 relative border border-black rounded-lg hover:border-black"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Image on the left */}
                <div className="relative flex-shrink-0">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-drink.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg pointer-events-none"></div>
                  {drink.isPopular && (
                    <div className="absolute -top-1 -right-1 badge badge-secondary badge-xs p-1">
                      <Star size={8} />
                    </div>
                  )}
                </div>

                {/* Details on the right */}
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-base-content truncate">{drink.name}</h3>
                    <span className="text-lg font-bold text-primary ml-2">{formatPrice(drink.basePrice)}</span>
                  </div>
                  
                  <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                    {drink.description}
                  </p>

                  <div className="flex flex-wrap gap-1 text-xs">
                    <span className="badge badge-outline badge-xs p-2">
                      {drink.sizes.length} {t('menu.sizes')}
                    </span>
                    <span className="badge badge-outline badge-xs p-2">
                      {drink.milkOptions.length} {t('menu.milkOptions')}
                    </span>
                    {drink.temperatureOptions.includes('Hot') && drink.temperatureOptions.includes('Iced') && (
                      <span className="badge badge-outline badge-xs p-2">{t('menu.hotIced')}</span>
                    )}
                  </div>
                </div>

                {/* Circular Add Button - Bottom Right */}
                <button
                  onClick={(e) => handleQuickAddToCart(e, drink)}
                  className="absolute bottom-4 right-4 btn btn-circle btn-primary btn-sm hover:btn-primary-focus transition-all duration-200"
                  aria-label={`Quick add ${drink.name} to cart`}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MenuPage;