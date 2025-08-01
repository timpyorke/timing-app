import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { Drink, DrinkSize, DrinkAddOn, CartItem } from '../types';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice, generateId } from '../utils';

const MenuDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, toggleCart } = useCart();

  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<DrinkSize | null>(null);
  const [selectedMilk, setSelectedMilk] = useState('');
  const [selectedSweetness, setSelectedSweetness] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<DrinkAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDrink = async () => {
      if (!id) return;
      
      try {
        const drinkData = await apiService.getDrinkDetails(id);
        
        if (drinkData) {
          setDrink(drinkData);
          setSelectedSize(drinkData.sizes[0]);
          setSelectedMilk(drinkData.milkOptions?.[0] || '');
          setSelectedSweetness(drinkData.sweetnessLevels[0]);
          // Default to 'Iced' if available, otherwise first option
          const defaultTemp = drinkData.temperatureOptions.includes('Iced') ? 'Iced' : drinkData.temperatureOptions[0];
          setSelectedTemperature(defaultTemp);
        } else {
          console.error('Drink not found');
          setDrink(null);
        }
      } catch (error) {
        console.error('Failed to fetch drink details:', error);
        setDrink(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDrink();
  }, [id]);

  const calculateTotalPrice = (): number => {
    if (!drink || !selectedSize) return 0;
    
    const basePrice = drink.basePrice + selectedSize.priceModifier;
    const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return (basePrice + addOnsPrice) * quantity;
  };

  const handleAddOnToggle = (addOn: DrinkAddOn) => {
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
    if (!drink || !selectedSize) return;

    const cartItem: CartItem = {
      id: generateId(),
      menuId: drink.id,
      menuName: drink.name,
      imageUrl: drink.image,
      size: selectedSize,
      milk: selectedMilk,
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

  if (!drink) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-base-content/60">Drink not found</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary mt-4"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="relative">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-64 object-cover rounded-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder-drink.svg';
          }}
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          {drink.isPopular && (
            <div className="badge badge-secondary p-3">
              <Star size={12} className="mr-1" />
              Popular
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">{drink.name}</h1>
          <p className="text-base-content/70 mt-2">{drink.description}</p>
          <p className="text-2xl font-bold text-primary mt-2">{formatPrice(drink.basePrice)}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Size</h3>
            <div className="grid grid-cols-1 gap-2">
              {drink.sizes.map((size) => (
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

          {drink.milkOptions && drink.milkOptions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Milk</h3>
              <div className="grid grid-cols-2 gap-2">
                {drink.milkOptions.map((milk) => (
                  <button
                    key={milk}
                    onClick={() => setSelectedMilk(milk)}
                    className={`btn btn-outline btn-sm ${
                      selectedMilk === milk ? 'btn-active' : ''
                    }`}
                  >
                    {milk}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Sweetness</h3>
            <div className="grid grid-cols-3 gap-2">
              {drink.sweetnessLevels.map((sweetness) => (
                <button
                  key={sweetness}
                  onClick={() => setSelectedSweetness(sweetness)}
                  className={`btn btn-outline btn-sm ${
                    selectedSweetness === sweetness ? 'btn-active' : ''
                  }`}
                >
                  {sweetness}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Temperature</h3>
            <div className="grid grid-cols-2 gap-2">
              {drink.temperatureOptions.map((temp) => (
                <button
                  key={temp}
                  onClick={() => setSelectedTemperature(temp)}
                  className={`btn btn-outline btn-sm ${
                    selectedTemperature === temp ? 'btn-active' : ''
                  }`}
                  disabled={temp === 'Hot'}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Add-ons</h3>
            <div className="space-y-2">
              {drink.addOns.map((addOn) => (
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
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold w-12 text-center text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn btn-ghost btn-sm p-2"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-right">
                <p className="text-sm text-base-content/60">Total</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(calculateTotalPrice())}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-touch w-full text-lg font-bold shadow-lg"
              disabled={!selectedSize}
            >
              <ShoppingCart size={20} className="mr-2" />
              Add {quantity} to Cart • {formatPrice(calculateTotalPrice())}
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
            Add to Cart • {formatPrice(calculateTotalPrice())}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDetailsPage;