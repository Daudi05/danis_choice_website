import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { productService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminProducts() {
  const toast    = useToast();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    productService.getAll({ search, per_page: 50 })
      .then(r => setProducts(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleDelete = async id => {
    if (!confirm('Delete this product?')) return;
    try { await productService.delete(id); toast('Product deleted', 'success'); load(); }
    catch (err) { toast(typeof err==='string'?err:'Failed to delete', 'error'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h2>Products</h2><p style={{color:'var(--gray-500)',fontSize:'.875rem'}}>{products.length} products</p></div>
        <div style={{display:'flex',gap:10}}>
          <input className="form-input" style={{maxWidth:220}} placeholder="Search products…"
            value={search} onChange={e=>setSearch(e.target.value)} />
          <Link to="/admin/products/new" className="btn btn-primary btn-sm"><Plus size={14}/> Add Product</Link>
        </div>
      </div>

      {loading ? <div className="page-loader"><div className="spinner"/></div> : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <img src={p.primary_image} alt={p.name} style={{width:44,height:56,objectFit:'cover',borderRadius:4,background:'var(--cream)'}}/>
                      <div>
                        <div style={{fontWeight:600,fontSize:'.875rem'}}>{p.name}</div>
                        <div style={{fontSize:'.72rem',color:'var(--gray-500)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name}</td>
                  <td>
                    <div style={{fontWeight:600}}>{p.sale_price ? `KES ${p.sale_price.toLocaleString()}` : `KES ${p.price.toLocaleString()}`}</div>
                    {p.sale_price && <div style={{textDecoration:'line-through',fontSize:'.72rem',color:'var(--gray-300)'}}>KES {p.price.toLocaleString()}</div>}
                  </td>
                  <td>
                    <span style={{fontWeight:600,color:p.stock===0?'var(--danger)':p.stock<10?'var(--gold)':'inherit'}}>{p.stock}</span>
                  </td>
                  <td>{p.is_featured && <span className="badge badge-rose">✦ Featured</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <Link to={`/product/${p.slug}`} className="btn btn-ghost btn-sm" style={{padding:'5px 8px'}}><Eye size={14}/></Link>
                      <Link to={`/admin/products/${p.id}/edit`} className="btn btn-outline btn-sm" style={{padding:'5px 8px'}}><Edit size={14}/></Link>
                      <button className="btn btn-sm" style={{padding:'5px 8px',background:'#fee2e2',color:'var(--danger)'}} onClick={()=>handleDelete(p.id)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length===0 && <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--gray-500)'}}>No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
