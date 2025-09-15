import React, { useState, useEffect } from 'react';
import { Search, Star, Plus } from 'lucide-react';
import { useTranslation, subscribeToLanguageChange } from '../i18n/stub';
import { Menu, MenuCategory } from '../types';
import { apiService } from '../services/api';
import { remoteConfigService, MenuCategoryConfigItem } from '../services/remoteConfig';
import { formatPrice, debounce } from '../utils';
import QuickAddBottomSheet from '../components/QuickAddBottomSheet';

const MenuPage: React.FC = () => {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<Menu[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMenuForQuickAdd, setSelectedMenuForQuickAdd] = useState<Menu | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      // Fetch menu data
      const menuData = await apiService.getMenu();

      // Fetch Remote Config for category control
      const categoryConfig: MenuCategoryConfigItem[] = await remoteConfigService.checkMenuCategoryConfig();

      // If config exists, filter menu and categories accordingly
      if (categoryConfig.length > 0) {
        const allowedTypes = new Set(categoryConfig.map(c => c.type.toLowerCase()));
        const orderMap = new Map(categoryConfig.map(c => [c.type.toLowerCase(), c.order] as const));

        // Filter categories by allowed types and sort by config order
        const filteredCategories = menuData.categories
          .filter(cat => allowedTypes.has(cat.id.toLowerCase()))
          .sort((a, b) => (orderMap.get(a.id.toLowerCase()) ?? 0) - (orderMap.get(b.id.toLowerCase()) ?? 0));

        // Filter menu items that belong to allowed categories only
        const filteredMenu = menuData.menu.filter(item => allowedTypes.has(item.category.toLowerCase()));

        setMenuItems(filteredMenu);
        setCategories(filteredCategories);
        setFilteredMenuItems([...filteredMenu].reverse());

        // Reset selected category if it's not allowed anymore
        if (selectedCategory !== 'all' && !allowedTypes.has(selectedCategory.toLowerCase())) {
          setSelectedCategory('all');
        }
      } else {
        // No config: fall back to API order and all categories
        setMenuItems(menuData.menu);
        setCategories(menuData.categories);
        setFilteredMenuItems([...menuData.menu].reverse());
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Subscribe to language changes and refresh menu
  useEffect(() => {
    const unsubscribe = subscribeToLanguageChange(() => {
      fetchMenu();
    });

    return unsubscribe;
  }, []);

  const debouncedSearch = debounce((...args: unknown[]) => {
    const [query, category] = args as [string, string];
    let filtered = menuItems;

    if (category !== 'all') {
      filtered = filtered.filter(menuItem => menuItem.category === category);
    }

    if (query.trim()) {
      filtered = filtered.filter(menuItem =>
        menuItem.name.toLowerCase().includes(query.toLowerCase()) ||
        menuItem.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredMenuItems([...filtered].reverse());
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, menuItems]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleQuickAddClick = (e: React.MouseEvent, menuItem: Menu) => {
    e.stopPropagation();
    setSelectedMenuForQuickAdd(menuItem);
    setIsQuickAddOpen(true);
  };

  const handleCloseQuickAdd = () => {
    setIsQuickAddOpen(false);
    setSelectedMenuForQuickAdd(null);
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
          className={`btn btn-sm whitespace-nowrap px-4 py-2 ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'
            }`}
        >
          {t('menu.all')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`btn btn-sm whitespace-nowrap px-4 py-2 ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {filteredMenuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/60">{t('menu.noResults')}</p>
          <p className="text-sm text-base-content/40 mt-1">
            {t('menu.noResultsSubtext')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMenuItems.map((menuItem) => (
            <div
              key={menuItem.id}
              onClick={(e) => handleQuickAddClick(e, menuItem)}
              className="card-menu p-2 group cursor-pointer hover:shadow-xl transition-all duration-200 relative border border-black rounded-lg hover:border-black"
            >
              <div className="flex items-start gap-2 p-1">
                {/* Image on the left */}
                <div className="relative flex-shrink-0">
                  <img
                    src={menuItem.image}
                    alt={menuItem.name}
                    className="w-24 h-24 object-cover object-center rounded-lg group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-menu.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg pointer-events-none"></div>
                  {menuItem.isPopular && (
                    <div className="absolute -top-1 -right-1 badge badge-secondary badge-xs p-1">
                      <Star size={8} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base text-base-content truncate">{menuItem.name}</h3>
                    <span className="text-lg font-bold text-primary ml-2">{formatPrice(menuItem.basePrice)}</span>
                  </div>

                  <p className="text-xs text-base-content/70 line-clamp-2 mb-2">
                    {menuItem.description}
                  </p>

                  {/* <div className="flex flex-wrap gap-1 text-xs">
                    {menuItem.sizes.length > 0 && (
                      <span className="badge badge-outline badge-xs p-1">
                        {menuItem.sizes.length} {t('menu.sizes')}
                      </span>
                    )}
                    {menuItem.milkOptions.length > 0 && (
                      <span className="badge badge-outline badge-xs p-1">
                        {menuItem.milkOptions.length} {t('menu.milkOptions')}
                      </span>
                    )}
                    {menuItem.temperatureOptions.includes('Hot') && menuItem.temperatureOptions.includes('Iced') && (
                      <span className="badge badge-outline badge-xs p-1">{t('menu.hotIced')}</span>
                    )}
                  </div> */}
                </div>

                {/* Circular Add Button - Bottom Right */}
                <button
                  onClick={(e) => handleQuickAddClick(e, menuItem)}
                  className="absolute bottom-3 right-3 btn btn-circle btn-primary btn-sm hover:btn-primary-focus transition-all duration-200"
                  aria-label={`Quick add ${menuItem.name} to cart`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuickAddBottomSheet
        isOpen={isQuickAddOpen}
        onClose={handleCloseQuickAdd}
        menuItem={selectedMenuForQuickAdd}
      />
    </div>
  );
};

export default MenuPage;
