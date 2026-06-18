import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Upload, Plus } from 'lucide-react';
import { productService, uploadService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SIZES_CLOTHES = ['XS','S','M','L','XL','XXL'];
const SIZES_SHOES   = ['35','36','37','38','39','40','41','42'];

export default function ProductForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const isEdit   = !!id;

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [form, setForm] = useState({
    name:'', description:'', price:'', sale_price:'',
    category_id:'', stock:'', gender:'ladies',
    sizes:[], colors:[], is_featured:false, images:[]
  });
  const [newColor, setNewColor] = useState('');

  useEffect(() => {
    productService.getCategories().then(r => setCategories(r.data.data));
    if (isEdit) {
      productService.getById(id).then(r => {
        const p = r.data.data;
        setForm({
          name:p.name, description:p.description||'',
          price:p.price, sale_price:p.sale_price||'',
          category_id:p.category_id, stock:p.stock,
          gender:p.gender, sizes:p.sizes||[], colors:p.colors||[],
          is_featured:p.is_featured,
          images:p.images?.map(i=>i.url)||[],
        });
      });
    }
  }, [id]);

  const handleUpload = async e => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(f => uploadService.upload(f).then(r => r.data.data.url)));
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
      toast('Images uploaded', 'success');
    } catch { toast('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  const toggleSize = s => setForm(f => ({
    ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x=>x!==s) : [...f.sizes,s]
  }));

  const addColor = () => {
    if (newColor.trim() && !form.colors.includes(newColor.trim())) {
      setForm(f => ({...f, colors:[...f.colors, newColor.trim()]}));
      setNewColor('');
    }
  };

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, price:parseFloat(form.price), stock:parseInt(form.stock), sale_price:form.sale_price?parseFloat(form.sale_price):null };
      if (isEdit) { await productService.update(id, payload); toast('Product updated','success'); }
      else        { await productService.create(payload); toast('Product created','success'); }
      navigate('/admin/products');
    } catch (err) { toast(typeof err==='string'?err:'Save failed','error'); }
    finally { setLoading(false); }
  };

  const cat = categories.find(c => c.id === parseInt(form.category_id));
  const sizeOptions = cat?.slug === 'shoes' ? SIZES_SHOES : SIZES_CLOTHES;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>{isEdit ? 'Edit Product' : 'New Product'}</h2>
      </div>
      <form onSubmit={submit}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24,alignItems:'start'}}>
          <div style={{display:'flex',flexDirection:'column',gap:20}}>

            {/* Basic info */}
            <div className="admin-table-card" style={{padding:24}}>
              <h3 style={{marginBottom:18,fontSize:'1rem'}}>Product Information</h3>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" placeholder="e.g. Floral Wrap Dress" value={form.name}
                  onChange={e=>setForm({...form,name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={4} placeholder="Describe this product…"
                  value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (KES) *</label>
                  <input className="form-input" type="number" min="0" step="0.01"
                    value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price (KES)</label>
                  <input className="form-input" type="number" min="0" step="0.01"
                    value={form.sale_price} onChange={e=>setForm({...form,sale_price:e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input className="form-input" type="number" min="0"
                    value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category_id}
                    onChange={e=>setForm({...form,category_id:e.target.value,sizes:[]})} required>
                    <option value="">Select category</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Sizes */}
            {form.category_id && (
              <div className="admin-table-card" style={{padding:24}}>
                <h3 style={{marginBottom:18,fontSize:'1rem'}}>Available Sizes</h3>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {sizeOptions.map(s=>(
                    <button key={s} type="button"
                      className={`size-btn ${form.sizes.includes(s)?'active':''}`}
                      onClick={()=>toggleSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            <div className="admin-table-card" style={{padding:24}}>
              <h3 style={{marginBottom:18,fontSize:'1rem'}}>Colors</h3>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                {form.colors.map(c=>(
                  <span key={c} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',background:'var(--cream)',borderRadius:100,fontSize:'.78rem'}}>
                    {c}
                    <button type="button" onClick={()=>setForm(f=>({...f,colors:f.colors.filter(x=>x!==c)}))}><X size={12}/></button>
                  </span>
                ))}
              </div>
              <div style={{display:'flex',gap:8}}>
                <input className="form-input" placeholder="e.g. Rose, Navy, Ivory"
                  value={newColor} onChange={e=>setNewColor(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addColor())} style={{flex:1}}/>
                <button type="button" className="btn btn-outline btn-sm" onClick={addColor}><Plus size={14}/> Add</button>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {/* Images */}
            <div className="admin-table-card" style={{padding:24}}>
              <h3 style={{marginBottom:18,fontSize:'1rem'}}>Product Images</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {form.images.map((url,i)=>(
                  <div key={i} style={{position:'relative',aspectRatio:'3/4',borderRadius:8,overflow:'hidden',background:'var(--cream)'}}>
                    <img src={url} alt={`img-${i}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    <button type="button" onClick={()=>setForm(f=>({...f,images:f.images.filter((_,j)=>j!==i)}))}
                      style={{position:'absolute',top:6,right:6,background:'rgba(0,0,0,.5)',color:'white',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                      <X size={12}/>
                    </button>
                    {i===0 && <span style={{position:'absolute',bottom:6,left:6,background:'rgba(0,0,0,.6)',color:'white',fontSize:'.6rem',padding:'2px 6px',borderRadius:4}}>Primary</span>}
                  </div>
                ))}
              </div>
              <label className="btn btn-outline btn-sm w-full" style={{justifyContent:'center',cursor:'pointer'}}>
                <Upload size={14}/> {uploading?'Uploading…':'Upload Images'}
                <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleUpload} disabled={uploading}/>
              </label>
            </div>

            {/* Settings */}
            <div className="admin-table-card" style={{padding:24}}>
              <h3 style={{marginBottom:18,fontSize:'1rem'}}>Settings</h3>
              <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                <input type="checkbox" checked={form.is_featured} onChange={e=>setForm({...form,is_featured:e.target.checked})}/>
                <span style={{fontSize:'.875rem',fontWeight:500}}>Featured product</span>
              </label>
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
