import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { adminService } from '../../services/api';

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dc_token');
    if (!token) { setLoading(false); return; } // skip if not logged in

    adminService.dashboard()
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"/></div>;
  if (!data)   return (
    <div style={{padding:40,textAlign:'center',color:'var(--gray-500)'}}>
      Unable to load dashboard. Please log in again.
    </div>
  );

  const { metrics, recent_orders, top_products, status_breakdown } = data;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h2>Dashboard</h2><p style={{color:'var(--gray-500)',fontSize:'.875rem'}}>Overview of your store</p></div>
      </div>

      <div className="admin-metrics">
        {[
          [<TrendingUp size={20}/>, `KES ${metrics.total_revenue?.toLocaleString()}`, 'Total Revenue', '#d1fae5','#059669'],
          [<ShoppingBag size={20}/>, metrics.total_orders, 'Total Orders', '#dbeafe','#2563eb'],
          [<Package size={20}/>, metrics.total_products, 'Products', '#fef3c7','#d97706'],
          [<Users size={20}/>, metrics.total_customers, 'Customers', '#ede9fe','#7c3aed'],
        ].map(([icon,val,label,bg,color])=>(
          <div key={label} className="metric-card">
            <div className="metric-icon" style={{background:bg,color}}>{icon}</div>
            <div className="metric-value" style={{color}}>{val}</div>
            <div className="metric-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20,marginBottom:24}}>
        {/* Chart */}
        <div className="admin-table-card" style={{padding:24}}>
          <h3 style={{fontSize:'1rem',marginBottom:18}}>Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={status_breakdown.map(s=>({name:s.status.replace('_',' '),count:s.count}))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="count" fill="#c9867c" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="admin-table-card" style={{padding:24}}>
          <h3 style={{fontSize:'1rem',marginBottom:18}}>Top Selling Products</h3>
          {top_products.map((tp,i)=>(
            <div key={tp.product.id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid var(--gray-100)'}}>
              <span style={{fontFamily:'var(--font-heading)',fontSize:'1.1rem',color:'var(--gray-300)',width:24}}>{i+1}</span>
              <img src={tp.product.primary_image} alt={tp.product.name} style={{width:36,height:44,objectFit:'cover',borderRadius:4}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'.82rem',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tp.product.name}</div>
                <div style={{fontSize:'.72rem',color:'var(--gray-500)'}}>{tp.total_sold} sold</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-table-card">
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--gray-100)',fontWeight:700,fontSize:'.95rem'}}>Recent Orders</div>
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {recent_orders.map(o=>(
              <tr key={o.id}>
                <td><strong style={{fontFamily:'var(--font-heading)'}}>{o.order_number}</strong></td>
                <td>{o.customer?.name}<br/><span style={{fontSize:'.72rem',color:'var(--gray-500)'}}>{o.customer?.email}</span></td>
                <td>{o.items.length}</td>
                <td><strong>KES {o.total.toLocaleString()}</strong></td>
                <td><span className={`badge badge-${o.status==='delivered'?'success':o.status==='pending'?'pending':'gold'}`}>{o.status}</span></td>
                <td style={{fontSize:'.78rem',color:'var(--gray-500)'}}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}