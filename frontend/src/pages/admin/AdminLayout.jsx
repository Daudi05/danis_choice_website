import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, PlusCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Admin.css';

const NAV = [
  { to:'/admin',          icon:<LayoutDashboard size={18}/>, label:'Dashboard', end:true },
  { to:'/admin/products', icon:<Package size={18}/>,         label:'Products' },
  { to:'/admin/orders',   icon:<ShoppingBag size={18}/>,     label:'Orders' },
  { to:'/admin/customers',icon:<Users size={18}/>,           label:'Customers' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div>DANIS<br/><span>ADMIN</span></div>
        </div>
        <div className="admin-user">{user?.name}</div>
        <nav className="admin-nav">
          {NAV.map(n=>(
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({isActive})=>`admin-link${isActive?' active':''}`}>
              {n.icon}{n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{padding:'0 12px',marginTop:'auto'}}>
          <NavLink to="/admin/products/new" className="admin-link" style={{background:'var(--rose)',color:'white',marginBottom:8}}>
            <PlusCircle size={18}/> Add Product
          </NavLink>

          {/* View Store — opens public site without logging out */}
          <Link to="/" className="admin-link" style={{marginBottom:8,opacity:.75}}>
            <ExternalLink size={18}/> View Store
          </Link>

          <button onClick={()=>{logout();navigate('/');}} className="admin-link admin-logout">
            <LogOut size={18}/> Sign Out
          </button>
        </div>
      </aside>
      <main className="admin-main"><Outlet/></main>
    </div>
  );
}