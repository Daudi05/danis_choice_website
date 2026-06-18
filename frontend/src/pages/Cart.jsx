import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import '../styles/Cart.css';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const toast    = useToast();
  const navigate = useNavigate();

  const handleUpdate = async (id, qty) => {
    if (qty < 1) { removeItem(id); return; }
    try { await updateItem(id, qty); }
    catch (err) { toast(typeof err === 'string' ? err : 'Error updating cart', 'error'); }
  };

  const handleRemove = async (id) => {
    try { await removeItem(id); toast('Item removed', 'info'); }
    catch { toast('Error removing item', 'error'); }
  };

  if (cart.items.length === 0) return (
    <div className="empty-cart" style={{paddingTop:68}}>
      <ShoppingBag size={56} color="var(--gray-300)"/>
      <h2>Your bag is empty</h2>
      <p>Add some beautiful pieces to your bag</p>
      <Link to="/shop" className="btn btn-primary">Continue Shopping <ArrowRight size={16}/></Link>
    </div>
  );

  const shipping = 200;
  const total    = cart.total + shipping;

  return (
    <div className="cart-page" style={{ paddingTop: 68 }}>
      <div className="container">
        <h1 className="cart-title">Your Bag <span>({cart.count} {cart.count===1?'item':'items'})</span></h1>
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <Link to={`/product/${item.product?.slug}`} className="cart-img-wrap">
                  <img src={item.product?.primary_image} alt={item.product?.name} className="cart-img"/>
                </Link>
                <div className="cart-item-info">
                  <div className="ci-cat">{item.product?.category?.name}</div>
                  <Link to={`/product/${item.product?.slug}`} className="ci-name">{item.product?.name}</Link>
                  {item.size  && <div className="ci-meta">Size: {item.size}</div>}
                  {item.color && <div className="ci-meta">Color: {item.color}</div>}
                  <div className="ci-bottom">
                    <div className="ci-qty">
                      <button onClick={() => handleUpdate(item.id, item.quantity-1)}><Minus size={12}/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdate(item.id, item.quantity+1)}><Plus size={12}/></button>
                    </div>
                    <button className="ci-remove" onClick={() => handleRemove(item.id)}><Trash2 size={14}/> Remove</button>
                  </div>
                </div>
                <div className="ci-price">KES {item.subtotal?.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>KES {cart.total.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>KES {shipping.toLocaleString()}</span></div>
            <div className="summary-row total"><span>Total</span><span>KES {total.toLocaleString()}</span></div>
            <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={16}/>
            </button>
            <Link to="/shop" className="continue-link">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
