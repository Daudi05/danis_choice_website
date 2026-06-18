import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderService } from '../services/api';
import '../styles/Orders.css';

const STATUS_COLORS = {
  pending:'badge-pending', confirmed:'badge-gold', processing:'badge-gold',
  shipped:'badge-success', delivered:'badge-success', cancelled:'badge-rose', refunded:'badge-rose'
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded,setExpanded]= useState(null);

  useEffect(() => {
    orderService.getAll().then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader" style={{paddingTop:68}}><div className="spinner"/></div>;

  if (orders.length === 0) return (
    <div style={{paddingTop:68,minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:'40px 24px',textAlign:'center'}}>
      <Package size={56} color="var(--gray-300)"/>
      <h2>No orders yet</h2>
      <p style={{color:'var(--gray-500)'}}>Your order history will appear here</p>
      <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 68 }}>
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        <h1 style={{ marginBottom: 28, fontSize: '1.5rem' }}>My Orders</h1>
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <div className="order-number">{order.order_number}</div>
                  <div className="order-meta">{new Date(order.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})} · {order.items.length} item{order.items.length!==1?'s':''}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span className={`badge ${STATUS_COLORS[order.status]||'badge-gold'}`}>{order.status}</span>
                  <strong>KES {order.total.toLocaleString()}</strong>
                  <ChevronRight size={16} style={{transition:'transform .2s',transform:expanded===order.id?'rotate(90deg)':'rotate(0)'}}/>
                </div>
              </div>
              {expanded === order.id && (
                <div className="order-details">
                  {order.items.map(item=>(
                    <div key={item.id} className="order-item">
                      <img src={item.product?.primary_image} alt={item.product?.name} className="oi-img"/>
                      <div className="oi-info">
                        <div className="oi-name">{item.product?.name}</div>
                        <div className="oi-meta">{item.size&&`Size: ${item.size}`} {item.color&&`· ${item.color}`} · Qty: {item.quantity}</div>
                      </div>
                      <div className="oi-price">KES {(item.price*item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                  <div className="order-footer">
                    <div><span>Delivery to: </span><strong>{order.shipping_name}</strong> · {order.shipping_address}</div>
                    <div style={{fontWeight:700}}>Total: KES {order.total.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
