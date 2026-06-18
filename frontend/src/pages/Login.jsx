import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Auth.css';

export default function Login() {
  const { login, isAdmin } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from || '/';

  const [form,    setForm]    = useState({ email:'', password:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      navigate(user.role === 'admin' ? '/admin' : from);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80" alt="Fashion"/>
        <div className="auth-image-overlay">
          <div className="auth-brand">DANIS<br/><span>CHOICE</span></div>
          <p>Your destination for curated ladies' fashion</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-sub">Sign in to your account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="your@email.com"
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <input className="form-input" type={showPw?'text':'password'}
                  placeholder="••••••••" value={form.password}
                  onChange={e=>setForm({...form,password:e.target.value})} required
                  style={{paddingRight:44}} />
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--gray-500)',display:'flex'}}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{width:'100%',justifyContent:'center',marginTop:8}}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>

        </div>
      </div>
    </div>
  );
}
