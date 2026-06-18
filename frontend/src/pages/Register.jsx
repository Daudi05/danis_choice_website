import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Auth.css';

export default function Register() {
  const { register } = useAuth();
  const toast        = useToast();
  const navigate     = useNavigate();

  const [form,    setForm]    = useState({ name:'', email:'', password:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()  || form.name.length < 2)  e.name     = 'Name must be at least 2 characters';
    if (!form.email.includes('@'))                     e.email    = 'Valid email required';
    if (form.password.length < 8)                     e.password = 'Password must be at least 8 characters';
    return e;
  };

  const submit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const user = await register(form);
      toast(`Welcome to Danis Choice, ${user.name.split(' ')[0]}!`, 'success');
      navigate('/shop');
    } catch (err) {
      setErrors({ general: typeof err === 'string' ? err : 'Registration failed' });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80" alt="Fashion"/>
        <div className="auth-image-overlay">
          <div className="auth-brand">DANIS<br/><span>CHOICE</span></div>
          <p>Join thousands of stylish women</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-sub">Join the Danis Choice family</p>

          {errors.general && <div className="auth-error">{errors.general}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-input ${errors.name?'error':''}`} placeholder="Jane Kamau"
                value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className={`form-input ${errors.email?'error':''}`} type="email" placeholder="your@email.com"
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <input className={`form-input ${errors.password?'error':''}`}
                  type={showPw?'text':'password'} placeholder="Min 8 characters"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required
                  style={{paddingRight:44}} />
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--gray-500)',display:'flex'}}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{width:'100%',justifyContent:'center',marginTop:8}}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p style={{fontSize:'.72rem',color:'var(--gray-500)',textAlign:'center',marginTop:12}}>
            By creating an account you agree to our <a href="#" style={{color:'var(--black)'}}>Terms</a> and <a href="#" style={{color:'var(--black)'}}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
