import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function Customers() {
  const toast   = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  const load = () => {
    setLoading(true);
    adminService.customers({ search }).then(r => setCustomers(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search]);

  const toggle = async id => {
    try { await adminService.toggleUser(id); toast('Updated','success'); load(); }
    catch (err) { toast(typeof err==='string'?err:'Failed','error'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h2>Customers</h2><p style={{color:'var(--gray-500)',fontSize:'.875rem'}}>{customers.length} customers</p></div>
        <input className="form-input" style={{maxWidth:240}} placeholder="Search customers…"
          value={search} onChange={e=>setSearch(e.target.value)} />
      </div>
      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Action</th></tr>
            </thead>
            <tbody>
              {customers.map(c=>(
                <tr key={c.id}>
                  <td><strong style={{fontSize:'.875rem'}}>{c.name}</strong></td>
                  <td style={{fontSize:'.82rem'}}>{c.email}</td>
                  <td style={{fontSize:'.82rem',color:'var(--gray-500)'}}>{c.phone||'—'}</td>
                  <td><span className={`badge ${c.is_active?'badge-success':'badge-rose'}`}>{c.is_active?'Active':'Inactive'}</span></td>
                  <td style={{fontSize:'.75rem',color:'var(--gray-500)'}}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className={`btn btn-sm ${c.is_active?'btn-outline':'btn-rose'}`} style={{padding:'5px 12px'}} onClick={()=>toggle(c.id)}>
                      {c.is_active?'Deactivate':'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length===0 && <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--gray-500)'}}>No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
