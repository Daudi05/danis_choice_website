import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) { setCart({ items: [], total: 0, count: 0 }); return; }
    try {
      const res = await cartService.get();
      setCart(res.data.data);
    } catch {}
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product_id, quantity = 1, size, color) => {
    setLoading(true);
    try {
      const res = await cartService.add({ product_id, quantity, size, color });
      setCart(res.data.data);
      return true;
    } catch (err) { throw err; }
    finally { setLoading(false); }
  };

  const updateItem = async (item_id, quantity) => {
    const res = await cartService.update({ item_id, quantity });
    setCart(res.data.data);
  };

  const removeItem = async (item_id) => {
    const res = await cartService.remove(item_id);
    setCart(res.data.data);
  };

  const clearCart = async () => {
    await cartService.clear();
    setCart({ items: [], total: 0, count: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
