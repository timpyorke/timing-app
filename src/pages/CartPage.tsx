import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart,
    getTotalPrice,
    getTotalItems 
  } = useCart();

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12 space-y-4">
          <ShoppingBag size={64} className="mx-auto text-base-content/30" />
          <div>
            <h2 className="text-xl font-bold text-base-content">Your cart is empty</h2>
            <p className="text-base-content/60 mt-2">
              Add some delicious TIMING drinks to get started!
            </p>
          </div>
          <button
            onClick={handleContinueShopping}
            className="btn btn-primary btn-touch"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Cart ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
        </h2>
        <button
          onClick={clearCart}
          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-base-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <img
                src={item.imageUrl}
                alt={item.menuName}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-drink.svg';
                }}
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{item.menuName}</h3>
                
                <div className="space-y-1 text-sm text-base-content/70">
                  <p>Size: {item.size.name}</p>
                  <p>Milk: {item.milk}</p>
                  <p>Sweetness: {item.sweetness}</p>
                  <p>Temperature: {item.temperature}</p>
                  {item.addOns.length > 0 && (
                    <p>Add-ons: {item.addOns.map(addon => addon.name).join(', ')}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-3 bg-base-100 rounded-lg p-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="btn btn-ghost btn-xs p-1"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="btn btn-ghost btn-xs p-1"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatPrice(item.totalPrice)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10 mt-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-base-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold">Subtotal:</span>
          <span className="font-bold">{formatPrice(getTotalPrice())}</span>
        </div>
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold">Tax:</span>
          <span className="font-bold">$0.00</span>
        </div>
        <div className="border-t border-base-300 pt-3">
          <div className="flex justify-between items-center text-xl">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-primary">{formatPrice(getTotalPrice())}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleContinueShopping}
          className="btn btn-outline btn-touch flex-1 text-base font-bold"
        >
          Continue Shopping
        </button>
        <button
          onClick={handleCheckout}
          className="btn btn-primary btn-touch flex-1 text-base font-bold"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;