import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';
import Home    from './pages/Home';
import Shop    from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Login    from './pages/Login';
import Register from './pages/Register';
import Cart     from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders   from './pages/Orders';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminLayout   from './pages/admin/AdminLayout';
import Dashboard     from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm   from './pages/admin/ProductForm';
import AdminOrders   from './pages/admin/AdminOrders';
import Customers     from './pages/admin/Customers';

import './styles/ProductDetail.css';

function RequireAuth({ children }) {
  const { user }    = useAuth();
  const location    = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Public */}
              <Route path="/"        element={<PublicLayout><Home/></PublicLayout>} />
              <Route path="/shop"    element={<PublicLayout><Shop/></PublicLayout>} />
              <Route path="/product/:slug" element={<PublicLayout><ProductDetail/></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              {/* Auth */}
              <Route path="/login"    element={<Login/>} />
              <Route path="/register" element={<Register/>} />

              {/* Protected */}
              <Route path="/cart"     element={<RequireAuth><PublicLayout><Cart/></PublicLayout></RequireAuth>} />
              <Route path="/checkout" element={<RequireAuth><PublicLayout><Checkout/></PublicLayout></RequireAuth>} />
              <Route path="/orders"   element={<RequireAuth><PublicLayout><Orders/></PublicLayout></RequireAuth>} />

              {/* Admin */}
              <Route path="/admin" element={<RequireAdmin><AdminLayout/></RequireAdmin>}>
                <Route index               element={<Dashboard/>} />
                <Route path="products"     element={<AdminProducts/>} />
                <Route path="products/new" element={<ProductForm/>} />
                <Route path="products/:id/edit" element={<ProductForm/>} />
                <Route path="orders"       element={<AdminOrders/>} />
                <Route path="customers"    element={<Customers/>} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
