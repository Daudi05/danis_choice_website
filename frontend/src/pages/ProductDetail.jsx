import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ChevronRight, Minus, Plus, ArrowLeft } from 'lucide-react';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import '../styles/ProductDetail.css';

export default function ProductDetail() {
  const { slug }               = useParams();
  const navigate               = useNavigate();
  const { addToCart, loading } = useCart();
  const { isLoggedIn }         = useAuth();
  const toast                  = useToast();

  const [product,   setProduct]   = useState(null);
  const [related,   setRelated]   = useState([]);
  const [fetching,  setFetching]  = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity,  setQuantity]  = useState(1);
  const [selSize,   setSelSize]   = useState('');
  const [selColor,  setSelColor]  = useState('');
  const [tab,       setTab]       = useState('description');

  useEffect(() => {
    setFetching(true);
    setActiveImg(0);
    productService.getBySlug(slug)
      .then(r => {
        setProduct(r.data.data);
        if (r.data.data.sizes?.length)  setSelSize(r.data.data.sizes[0]);
        if (r.data.data.colors?.length) setSelColor(r.data.data.colors[0]);
        return productService.getAll({ category: r.data.data.category?.slug, per_page: 4 });
      })
      .then(r => setRelated(r.data.data.filter(p => p.slug !== slug).slice(0,4)))
      .catch(() => navigate('/shop'))
      .finally(() => setFetching(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isLoggedIn()) { navigate('/login'); return; }
    try {
      await addToCart(product.id, quantity, selSize || null, selColor || null);
      toast('Added to your bag!', 'success');
    } catch (err) { toast(typeof err === 'string' ? err : 'Could not add to bag', 'error'); }
  };

  if (fetching) return <div className="page-loader" style={{paddingTop:68}}><div className="spinner"/></div>;
  if (!product) return null;

  const images = product.images || [];
  const price  = product.sale_price || product.price;
  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : null;

  return (
    <div className="product-detail" style={{ paddingTop: 68 }}>
      {/* Breadcrumb */}
      <div className="container breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14}/>
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14}/>
        <Link to={`/shop?category=${product.category?.slug}`}>{product.category?.name}</Link>
        <ChevronRight size={14}/>
        <span>{product.name}</span>
      </div>

      <div className="container pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="gallery-thumbs">
            {images.map((img, i) => (
              <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}>
                <img src={img.url} alt={`${product.name} ${i+1}`} />
              </button>
            ))}
          </div>
          <div className="gallery-main">
            {images[activeImg] ? (
              <img src={images[activeImg].url} alt={product.name} className="main-img" />
            ) : (
              <div className="main-img-placeholder">No Image</div>
            )}
            {discount && <span className="pd-badge">-{discount}% OFF</span>}
          </div>
        </div>

        {/* Info */}
        <div className="pd-info">
          <div className="pd-category">{product.category?.name}</div>
          <h1 className="pd-name">{product.name}</h1>

          <div className="pd-price-row">
            {product.sale_price ? (
              <>
                <span className="pd-price-sale">KES {Number(product.sale_price).toLocaleString()}</span>
                <span className="pd-price-orig">KES {Number(product.price).toLocaleString()}</span>
                <span className="badge badge-rose">Save {discount}%</span>
              </>
            ) : (
              <span className="pd-price">KES {Number(product.price).toLocaleString()}</span>
            )}
          </div>

          <div className="pd-stock">
            {product.stock > 10 ? <span className="in-stock">In Stock</span>
              : product.stock > 0 ? <span className="low-stock">Only {product.stock} left</span>
              : <span className="out-stock">Out of Stock</span>}
          </div>

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="pd-option">
              <div className="pd-option-label">Size: <strong>{selSize}</strong></div>
              <div className="size-options">
                {product.sizes.map(s => (
                  <button key={s} className={`size-btn ${selSize===s ? 'active':''}`}
                    onClick={() => setSelSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors?.length > 0 && (
            <div className="pd-option">
              <div className="pd-option-label">Color: <strong>{selColor}</strong></div>
              <div className="color-options">
                {product.colors.map(c => (
                  <button key={c} className={`color-btn ${selColor===c ? 'active':''}`}
                    onClick={() => setSelColor(c)}
                    style={{'--c': colorToHex(c)}} title={c} />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pd-option">
            <div className="pd-option-label">Quantity</div>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1,q-1))}><Minus size={14}/></button>
              <span className="qty-val">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock,q+1))}><Plus size={14}/></button>
            </div>
          </div>

          {/* Actions */}
          <div className="pd-actions">
            <button className="btn btn-primary btn-lg" style={{flex:1}}
              onClick={handleAddToCart} disabled={loading || product.stock === 0}>
              <ShoppingBag size={18}/>{loading ? 'Adding…' : 'Add to Bag'}
            </button>
            <button className="btn btn-outline btn-icon btn-lg"><Heart size={18}/></button>
          </div>

          {/* Tabs */}
          <div className="pd-tabs">
            {['description','details','shipping'].map(t => (
              <button key={t} className={`tab-btn ${tab===t ? 'active':''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {tab==='description' && <p>{product.description || 'No description available.'}</p>}
            {tab==='details' && (
              <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:8}}>
                {[['Category',product.category?.name],['Gender',product.gender],['Stock',product.stock + ' units'],
                  ['Sizes',product.sizes?.join(', ') || '—'],['Colors',product.colors?.join(', ') || '—']].map(([k,v])=>(
                  <li key={k} style={{display:'flex',gap:16,fontSize:'.875rem'}}>
                    <span style={{color:'var(--gray-500)',width:80,flexShrink:0}}>{k}</span>
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            )}
            {tab==='shipping' && (
              <div style={{fontSize:'.875rem',lineHeight:1.8}}>
                <p>🚚 <strong>Nairobi CBD:</strong> Same day delivery (orders before 2pm)</p>
                <p>📦 <strong>Nationwide:</strong> 1–3 business days</p>
                <p>↩️ <strong>Returns:</strong> 30 days, unworn with tags</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="section" style={{background:'var(--cream)'}}>
          <div className="container">
            <div style={{textAlign:'center',marginBottom:40}}>
              <span className="section-eyebrow">You May Also Like</span>
              <h2>Complete The Look</h2>
            </div>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function colorToHex(name){const map={'black':'#1a1a1a','white':'#f5f5f5','navy':'#1a2744','red':'#c0392b','rose':'#c9867c','pink':'#e8aab5','blush':'#f0d0cc','nude':'#d4a88a','beige':'#d4c4a8','cream':'#f5f0e8','ivory':'#f8f4ec','champagne':'#c8a97a','gold':'#b8955a','tan':'#c8956c','camel':'#c09060','chocolate':'#7b4c2a','sand':'#d4b896','sage':'#87a878','green':'#4a7c59','emerald':'#2d6a4f','forest green':'#2d5a3d','blue':'#3b5bdb','dusty pink':'#c4a0a0','burgundy':'#722f37','purple':'#6b3fa0'};return map[name.toLowerCase()]||'#c9867c';}
