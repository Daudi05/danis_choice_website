import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { orderService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import '../styles/Checkout.css';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const toast    = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ shipping_name:'', shipping_phone:'', shipping_address:'', shipping_city:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(null);
  const [errors,  setErrors]  = useState({});

  // ✅ navigate inside useEffect, not during render
  useEffect(() => {
    if (!done && cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, done, navigate]);

  const validate = () => {
    const e = {};
    if (!form.shipping_name.trim())    e.shipping_name    = 'Full name is required';
    if (!form.shipping_phone.trim())   e.shipping_phone   = 'Phone number is required';
    if (!form.shipping_address.trim()) e.shipping_address = 'Delivery address is required';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const res = await orderService.create(form);
      await clearCart();
      setDone(res.data.data);
      toast('Order placed successfully!', 'success');
    } catch (err) {
      toast(typeof err === 'string' ? err : 'Failed to place order', 'error');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="checkout-success" style={{paddingTop:68}}>
      <div className="success-card">
        <CheckCircle size={56} color="var(--success)"/>
        <h2>Order Placed!</h2>
        <p>Thank you! Your order <strong>{done.order_number}</strong> has been received.</p>
        <p style={{color:'var(--gray-500)',fontSize:'.875rem'}}>We'll send you a confirmation and delivery updates.</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginTop:16}}>
          <Link to="/orders" className="btn btn-primary">Track Order</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );

  // Render nothing while redirect is in progress
  if (cart.items.length === 0) return null;

  const shipping = 200;
  const total    = cart.total + shipping;

  return (
    <div className="checkout-page" style={{ paddingTop: 68 }}>
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-layout">
          {/* Form */}
          <form onSubmit={submit} className="checkout-form">
            <h3 className="form-section-title">Delivery Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className={`form-input ${errors.shipping_name?'error':''}`}
                placeholder="Jane Kamau" value={form.shipping_name}
                onChange={e=>setForm({...form,shipping_name:e.target.value})} />
              {errors.shipping_name && <div className="form-error">{errors.shipping_name}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className={`form-input ${errors.shipping_phone?'error':''}`}
                  placeholder="0712345678" value={form.shipping_phone}
                  onChange={e=>setForm({...form,shipping_phone:e.target.value})} />
                {errors.shipping_phone && <div className="form-error">{errors.shipping_phone}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">City / Town</label>
                <input className="form-input" placeholder="Nairobi"
                  value={form.shipping_city} onChange={e=>setForm({...form,shipping_city:e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea className={`form-input ${errors.shipping_address?'error':''}`} rows={3}
                placeholder="Building, street, area…" value={form.shipping_address}
                onChange={e=>setForm({...form,shipping_address:e.target.value})} />
              {errors.shipping_address && <div className="form-error">{errors.shipping_address}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Order Notes (Optional)</label>
              <textarea className="form-input" rows={2}
                placeholder="Any special instructions…" value={form.notes}
                onChange={e=>setForm({...form,notes:e.target.value})} />
            </div>
            <div className="payment-note">
              <strong>💳 Payment on Delivery</strong>
              <p>We accept cash and M-Pesa on delivery.</p>
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? 'Placing Order…' : `Place Order — KES ${total.toLocaleString()}`}
            </button>
          </form>

          {/* Summary */}
          <div className="checkout-summary">
            <h3>Your Bag ({cart.count})</h3>
            {cart.items.map(item=>(
              <div key={item.id} className="co-item">
                <img src={item.product?.primary_image} alt={item.product?.name} className="co-img"/>
                <div className="co-info">
                  <div className="co-name">{item.product?.name}</div>
                  <div className="co-meta">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`}</div>
                  <div className="co-meta">Qty: {item.quantity}</div>
                </div>
                <div className="co-price">KES {item.subtotal?.toLocaleString()}</div>
              </div>
            ))}
            <div className="co-divider"/>
            <div className="co-row"><span>Subtotal</span><span>KES {cart.total.toLocaleString()}</span></div>
            <div className="co-row"><span>Shipping</span><span>KES {shipping.toLocaleString()}</span></div>
            <div className="co-row co-total"><span>Total</span><span>KES {total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}