import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Menu, MenuSize, CartItem, MilkOption } from '../types';
import { useCart } from '../hooks/useCart';
import { formatPrice, generateId } from '../utils';
import { useTranslation } from '../i18n/stub';
import BottomSheet from './BottomSheet';

interface QuickAddBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: Menu | null;
}

const QuickAddBottomSheet: React.FC<QuickAddBottomSheetProps> = ({
  isOpen,
  onClose,
  menuItem
}) => {
  const { t } = useTranslation();
  const { addItem, toggleCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<MenuSize | null>(null);
  const [selectedMilk, setSelectedMilk] = useState<MilkOption | null>(null);
  const [selectedSweetness, setSelectedSweetness] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState('');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (menuItem && isOpen) {
      const firstEnabledSize = menuItem.sizes.find((size) => size.enable);
      setSelectedSize(firstEnabledSize || null);
      const firstEnabledMilk = menuItem.milkOptions?.find((milk) => milk.enable);
      setSelectedMilk(firstEnabledMilk || null);
      setSelectedSweetness(menuItem.sweetnessLevels[0] || '');
      const defaultTemp = menuItem.temperatureOptions[0] || '';
      setSelectedTemperature(defaultTemp);
      setQuantity(1);
    }
  }, [menuItem, isOpen]);

  const calculateTotalPrice = (): number => {
    if (!menuItem) return 0;

    const basePrice = menuItem.basePrice + (selectedSize && selectedSize.enable ? selectedSize.priceModifier : 0);
    const milkPrice = selectedMilk && selectedMilk.enable ? selectedMilk.price : 0;
    return (basePrice + milkPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!menuItem || !selectedSize || !selectedSize.enable) return;

    const cartItem: CartItem = {
      id: generateId(),
      menuId: menuItem.id,
      menuName: menuItem.name,
      imageUrl: menuItem.image,
      size: selectedSize && selectedSize.enable
        ? selectedSize
        : { id: 'default', name: 'Default', priceModifier: 0, enable: true },
      milk: selectedMilk && selectedMilk.enable
        ? selectedMilk
        : { id: 'none', name: 'None', price: 0, enable: true },
      sweetness: selectedSweetness,
      temperature: selectedTemperature,
      addOns: [], // Quick add doesn't include add-ons
      quantity,
      totalPrice: calculateTotalPrice(),
    };

    addItem(cartItem);
    onClose();

    setTimeout(() => {
      toggleCart();
    }, 300);
  };

  if (!menuItem) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('quickAdd.title')} ${menuItem.name}`}
      maxHeight="max-h-[80vh]"
    >
      <div className="p-4 pb-24">
        {/* Menu Info */}
        <div className="flex items-start gap-3 mb-4">
          <img
            src={menuItem.image}
            alt={menuItem.name}
            className="w-16 h-16 object-cover object-center rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-menu.svg';
            }}
          />
          <div className="flex-1">
            <h3 className="font-bold text-base">{menuItem.name}</h3>
            <p className="text-xs text-base-content/70 line-clamp-4 mt-1">
              {menuItem.description}
            </p>
            <p className="text-lg font-bold text-primary mt-1">{formatPrice(menuItem.basePrice)}</p>
          </div>
        </div>

        {/* Quick Customization Options */}
        <div className="space-y-3">
          {/* Size */}
          {menuItem.sizes && menuItem.sizes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">{t('menuDetails.size')}</h4>
              <div className="flex gap-2">
                {menuItem.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => size.enable && setSelectedSize(size)}
                    className={`btn btn-outline btn-xs flex-1 ${selectedSize?.id === size.id ? 'btn-active' : ''} ${!size.enable ? 'btn-disabled opacity-60 cursor-not-allowed' : ''
                      }`}
                    disabled={!size.enable || size.name === 'large'}
                  >
                    {size.name}
                    {size.priceModifier > 0 && ` +${formatPrice(size.priceModifier)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk (if available) */}
          {menuItem.milkOptions && menuItem.milkOptions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">{t('menuDetails.milk')}</h4>
              <div className="flex gap-2 flex-wrap">
                {menuItem.milkOptions.map((milk) => (
                  <button
                    key={milk.id}
                    onClick={() => milk.enable && setSelectedMilk(milk)}
                    className={`btn btn-outline btn-xs ${selectedMilk?.id === milk.id ? 'btn-active' : ''} ${!milk.enable ? 'btn-disabled opacity-60 cursor-not-allowed' : ''
                      }`}
                    disabled={!milk.enable || milk.name === 'oat'}
                  >
                    {milk.name}
                    {milk.price > 0 && ` +${formatPrice(milk.price)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {menuItem.sweetnessLevels && menuItem.sweetnessLevels.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">{t('menuDetails.sweetness')}</h4>
              <div className="flex gap-2">
                {menuItem.sweetnessLevels.map((sweetness) => (
                  <button
                    key={sweetness}
                    onClick={() => setSelectedSweetness(sweetness)}
                    className={`btn btn-outline btn-xs flex-1 ${selectedSweetness === sweetness ? 'btn-active' : ''
                      }`}
                  >
                    {sweetness}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Temperature */}
          {menuItem.temperatureOptions && menuItem.temperatureOptions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">{t('menuDetails.temperature')}</h4>
              <div className="flex gap-2">
                {menuItem.temperatureOptions.map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setSelectedTemperature(temp)}
                    className={`btn btn-outline btn-xs flex-1 ${selectedTemperature === temp ? 'btn-active' : ''
                      }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 p-4 z-60">
          <div className="flex items-center space-x-3">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 bg-base-200 rounded-lg p-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="btn btn-ghost btn-sm btn-circle"
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="font-bold w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn btn-primary flex-1 text-sm font-bold"
              disabled={!selectedSize || !selectedSize.enable}
            >
              <ShoppingCart size={16} className="mr-1" />
              {t('menuDetails.addToCart')} • {formatPrice(calculateTotalPrice())}
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default QuickAddBottomSheet;
