import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart }                  = useCart();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [search,       setSearch]       = useState('');
  const dropdownRef = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdown(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    setUserDropdown(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/shop',              label: 'All' },
    { to: '/shop?category=clothes', label: 'Clothes' },
    { to: '/shop?category=shoes',   label: 'Shoes' },
    { to: '/shop?category=bags',    label: 'Bags' },
  ];

  const transparent = isHome && !scrolled;

  return (
    <header className={`navbar ${transparent ? 'navbar-transparent' : 'navbar-solid'} ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">DANIS</span>
          <span className="logo-sub">CHOICE</span>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="navbar-link">{l.label}</Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Search */}
          <form onSubmit={handleSearch} className="navbar-search">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…" className="search-input" />
            <button type="submit"><Search size={16} /></button>
          </form>

          {/* Cart */}
          <Link to="/cart" className="navbar-icon-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
          </Link>

          {/* User dropdown — click controlled */}
          {user ? (
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className={`navbar-icon-btn user-trigger ${userDropdown ? 'active' : ''}`}
                onClick={() => setUserDropdown(prev => !prev)}
                aria-label="Account menu"
                aria-expanded={userDropdown}
              >
                <User size={20} />
              </button>

              {userDropdown && (
                <div className="user-dropdown user-dropdown-visible">
                  {/* User info header */}
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link to="/orders" className="dropdown-item" onClick={() => setUserDropdown(false)}>
                    <Package size={15} /> My Orders
                  </Link>

                  {isAdmin() && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setUserDropdown(false)}>
                      <LayoutDashboard size={15} /> Admin Panel
                    </Link>
                  )}

                  <div className="dropdown-divider" />

                  {/* Logout is a large, clearly visible button */}
                  <button className="dropdown-logout-btn" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-icon-btn" aria-label="Account">
              <User size={20} />
            </Link>
          )}

          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="mobile-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {isAdmin() && <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
              <button className="mobile-link mobile-logout" onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
          <form onSubmit={e => { handleSearch(e); setMenuOpen(false); }} style={{ padding: '12px 16px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products…" className="form-input" />
          </form>
        </div>
      )}
    </header>
  );
}