import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { Menu, MenuSize, MenuAddOn, CartItem, MilkOption } from '../types';
import { apiService } from '../services/api';
import { useCart } from '../hooks/useCart';
import { formatPrice, generateId } from '../utils';
import { useTranslation, subscribeToLanguageChange } from '../i18n/stub';

const MenuDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, toggleCart } = useCart();
  const { t } = useTranslation();

  const [menuItem, setMenuItem] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<MenuSize | null>(null);
  const [selectedMilk, setSelectedMilk] = useState<MilkOption | null>(null);
  const [selectedSweetness, setSelectedSweetness] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<MenuAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);

  const fetchMenuItem = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const menuItemData = await apiService.getMenuDetails(id);

      if (menuItemData) {
        setMenuItem(menuItemData);
        setSelectedSize(menuItemData.sizes[0] || null);
        setSelectedMilk(menuItemData.milkOptions?.[0] || null);
        setSelectedSweetness(menuItemData.sweetnessLevels[0] || '');
        // Default to first option (Iced)
        const defaultTemp = menuItemData.temperatureOptions[0] || '';
        setSelectedTemperature(defaultTemp);
      } else {
        console.error('Menu item not found');
        setMenuItem(null);
      }
    } catch (error) {
      console.error('Failed to fetch menu item details:', error);
      setMenuItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItem();
  }, [id]);

  // Subscribe to language changes and refresh menu details
  useEffect(() => {
    const unsubscribe = subscribeToLanguageChange(() => {
      fetchMenuItem();
    });

    return unsubscribe;
  }, [id]);

  const calculateTotalPrice = (): number => {
    if (!menuItem || !selectedSize) return 0;

    const basePrice = menuItem.basePrice + selectedSize.priceModifier;
    const milkPrice = selectedMilk?.price || 0;
    const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (basePrice + milkPrice + addOnsPrice) * quantity;
  };

  const handleAddOnToggle = (addOn: MenuAddOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item.id === addOn.id);
      if (exists) {
        return prev.filter(item => item.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const handleAddToCart = () => {
    if (!menuItem || !selectedSize) return;

    const cartItem: CartItem = {
      id: generateId(),
      menuId: menuItem.id,
      menuName: menuItem.name,
      imageUrl: menuItem.image,
      size: selectedSize,
      milk: selectedMilk || { id: 'none', name: 'None', price: 0 },
      sweetness: selectedSweetness,
      temperature: selectedTemperature,
      addOns: selectedAddOns,
      quantity,
      totalPrice: calculateTotalPrice(),
    };

    addItem(cartItem);

    // Show cart drawer after a brief delay
    setTimeout(() => {
      toggleCart();
    }, 300);
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

  if (!menuItem) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-base-content/60">{t('menuDetails.notFound')}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary mt-4"
          >
            {t('menuDetails.backToMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="relative">
        <img
          src={menuItem.image}
          alt={menuItem.name}
          className="w-full h-64 object-cover object-center rounded-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder-menu.svg';
          }}
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          {menuItem.isPopular && (
            <div className="badge badge-secondary p-3">
              <Star size={12} className="mr-1" />
              {t('menuDetails.popular')}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">{menuItem.name}</h1>
          <p className="text-base-content/70 mt-2">{menuItem.description}</p>
          <p className="text-2xl font-bold text-primary mt-2">{formatPrice(menuItem.basePrice)}</p>
        </div>

        <div className="space-y-6">
          {menuItem.sizes && menuItem.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t('menuDetails.size')}</h3>
              <div className="grid grid-cols-1 gap-2">
                {menuItem.sizes.map((size) => (
                  <label key={size.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={size.id}
                      checked={selectedSize?.id === size.id}
                      onChange={() => setSelectedSize(size)}
                      className="radio radio-primary mr-3"
                    />
                    <span className="flex-1">{size.name}</span>
                    {size.priceModifier > 0 && (
                      <span className="text-primary font-medium ml-auto">
                        + {formatPrice(size.priceModifier)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {menuItem.milkOptions && menuItem.milkOptions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t('menuDetails.milk')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {menuItem.milkOptions.map((milk) => (
                  <button
                    key={milk.id}
                    onClick={() => setSelectedMilk(milk)}
                    className={`btn btn-outline btn-sm ${selectedMilk?.id === milk.id ? 'btn-active' : ''
                      }`}
                  >
                    {milk.name}
                    {milk.price > 0 && (
                      <span className="text-primary font-medium ml-1">
                        +{formatPrice(milk.price)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {menuItem.sweetnessLevels && menuItem.sweetnessLevels.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t('menuDetails.sweetness')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {menuItem.sweetnessLevels.map((sweetness) => (
                  <button
                    key={sweetness}
                    onClick={() => setSelectedSweetness(sweetness)}
                    className={`btn btn-outline btn-sm ${selectedSweetness === sweetness ? 'btn-active' : ''
                      }`}
                  >
                    {sweetness}
                  </button>
                ))}
              </div>
            </div>
          )}

          {menuItem.temperatureOptions && menuItem.temperatureOptions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t('menuDetails.temperature')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {menuItem.temperatureOptions.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setSelectedTemperature(temp)}
                    className={`btn btn-outline btn-sm ${selectedTemperature === temp ? 'btn-active' : ''
                      }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">{t('menuDetails.addOns')}</h3>
            <div className="space-y-2">
              {menuItem.addOns.map((addOn) => (
                <label key={addOn.id} className="cursor-pointer flex items-center justify-between p-2 rounded-lg hover:bg-base-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAddOns.some(item => item.id === addOn.id)}
                      onChange={() => handleAddOnToggle(addOn)}
                      className="checkbox checkbox-primary mr-3"
                    />
                    <span>{addOn.name}</span>
                  </div>
                  <span className="text-primary font-medium">
                    + {formatPrice(addOn.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-base-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 bg-base-200 rounded-lg p-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-ghost btn-sm p-2"
                  disabled={quantity <= 1}
                  aria-label={t('aria.decreaseQuantity')}
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold w-12 text-center text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn btn-ghost btn-sm p-2"
                  aria-label={t('aria.increaseQuantity')}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm text-base-content/60">{t('menuDetails.total')}</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(calculateTotalPrice())}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-touch w-full text-lg font-bold shadow-lg"
              disabled={!selectedSize}
            >
              <ShoppingCart size={20} className="mr-2" />
              {t('menuDetails.addQuantityToCart', { quantity })} • {formatPrice(calculateTotalPrice())}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t-2 border-base-300 p-4 shadow-2xl">
        <div className="container mx-auto flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-base-200 rounded-lg p-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="btn btn-ghost btn-sm p-2"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold w-8 text-center text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="btn btn-ghost btn-sm p-2"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-touch flex-1 text-lg font-bold shadow-lg"
            disabled={!selectedSize}
          >
            <ShoppingCart size={20} className="mr-2" />
            {t('menuDetails.addToCart')} • {formatPrice(calculateTotalPrice())}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDetailsPage;