import { useState, useEffect, useCallback, Fragment } from 'react';
import { orderService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUSES = ['','pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function AdminOrders() {
  const toast   = useToast();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    orderService.adminAll({ status: filter || undefined })
      .then(r => setOrders(r.data.data))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try { await orderService.updateStatus(id, status); toast('Status updated','success'); load(); }
    catch (err) { toast(typeof err==='string'?err:'Failed','error'); }
  };

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h2>Orders</h2><p style={{color:'var(--gray-500)',fontSize:'.875rem'}}>{orders.length} orders</p></div>
        <select className="sort-select" value={filter} onChange={e=>setFilter(e.target.value)}>
          {STATUSES.map(s=><option key={s} value={s}>{s||'All Status'}</option>)}
        </select>
      </div>

      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Delivery Details</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o=>(
                <Fragment key={o.id}>
                  <tr>
                    <td><strong style={{fontFamily:'var(--font-heading)'}}>{o.order_number}</strong></td>

                    {/* Customer */}
                    <td>
                      <div style={{fontWeight:600,fontSize:'.85rem'}}>{o.customer?.name}</div>
                      <div style={{fontSize:'.72rem',color:'var(--gray-500)'}}>{o.customer?.email}</div>
                    </td>

                    {/* Delivery details — phone, address, city */}
                    <td>
                      <div style={{fontWeight:600,fontSize:'.85rem'}}>📞 {o.shipping_phone || o.customer?.phone || '—'}</div>
                      <div style={{fontSize:'.75rem',color:'var(--gray-500)'}}>{o.shipping_address || '—'}</div>
                      {o.shipping_city && <div style={{fontSize:'.72rem',color:'var(--gray-400)'}}>{o.shipping_city}</div>}
                    </td>

                    <td><div style={{fontSize:'.82rem',color:'var(--gray-500)',maxWidth:180}}>{o.items.map(i=>i.product?.name).join(', ')}</div></td>
                    <td><strong>KES {o.total.toLocaleString()}</strong></td>
                    <td>
                      <span className={`badge badge-${
                        o.status==='delivered'||o.status==='shipped' ? 'success' :
                        o.status==='cancelled'||o.status==='refunded' ? 'rose' : 'pending'
                      }`}>{o.status}</span>
                    </td>
                    <td style={{fontSize:'.78rem',color:'var(--gray-500)'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <select className="status-select" value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                        {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s=>(
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button onClick={()=>toggle(o.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--gray-500)',padding:4}}>
                        {expanded===o.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                    </td>
                  </tr>

                  {expanded===o.id && (
                    <tr style={{background:'var(--gray-50)'}}>
                      <td colSpan={9} style={{padding:'16px 20px'}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                          <div>
                            <div style={{fontWeight:700,marginBottom:10,fontSize:'.875rem'}}>📦 Delivery Information</div>
                            <table style={{fontSize:'.82rem',borderCollapse:'collapse',width:'100%'}}>
                              <tbody>
                                {[
                                  ['Recipient', o.shipping_name    || '—'],
                                  ['Phone',     o.shipping_phone   || o.customer?.phone || '—'],
                                  ['Address',   o.shipping_address || '—'],
                                  ['City',      o.shipping_city    || '—'],
                                  ['Notes',     o.notes            || 'None'],
                                ].map(([label, val])=>(
                                  <tr key={label}>
                                    <td style={{color:'var(--gray-500)',paddingRight:12,paddingBottom:6,whiteSpace:'nowrap'}}>{label}</td>
                                    <td style={{fontWeight:600,paddingBottom:6}}>{val}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div>
                            <div style={{fontWeight:700,marginBottom:10,fontSize:'.875rem'}}>🛍️ Items Ordered</div>
                            {o.items.map(item=>(
                              <div key={item.id} style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
                                <img src={item.product?.primary_image} alt={item.product?.name}
                                  style={{width:36,height:44,objectFit:'cover',borderRadius:4,flexShrink:0}}/>
                                <div style={{flex:1,fontSize:'.82rem'}}>
                                  <div style={{fontWeight:600}}>{item.product?.name}</div>
                                  <div style={{color:'var(--gray-500)'}}>
                                    {item.size  && `Size: ${item.size}`}
                                    {item.color && ` · ${item.color}`}
                                    {` · Qty: ${item.quantity}`}
                                  </div>
                                </div>
                                <div style={{fontWeight:700,fontSize:'.85rem'}}>KES {(item.price*item.quantity).toLocaleString()}</div>
                              </div>
                            ))}
                            <div style={{borderTop:'1px solid var(--gray-200)',paddingTop:8,marginTop:4,display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'.875rem'}}>
                              <span>Total</span><span>KES {o.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {orders.length===0 && (
                <tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'var(--gray-500)'}}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}