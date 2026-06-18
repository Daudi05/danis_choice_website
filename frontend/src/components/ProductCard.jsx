import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { isLoggedIn }         = useAuth();
  const toast                  = useToast();
  const navigate               = useNavigate();
  const [imgIdx,    setImgIdx] = useState(0);
  const [wishlist,  setWishlist] = useState(false);

  const images = product.images || [];
  const currentImg = images[imgIdx]?.url || product.primary_image;

  const handleAddToCart = async e => {
    e.preventDefault();
    if (!isLoggedIn()) { navigate('/login'); return; }
    try {
      await addToCart(product.id, 1);
      toast('Added to bag!', 'success');
    } catch (err) { toast(typeof err === 'string' ? err : 'Could not add to bag', 'error'); }
  };

  const discount = product.sale_price
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : null;

  return (
    <article className="product-card"
      onMouseEnter={() => images.length > 1 && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}>

      <Link to={`/product/${product.slug}`} className="product-img-wrap">
        {currentImg ? (
          <img src={currentImg} alt={product.name} className="product-img" loading="lazy" />
        ) : (
          <div className="product-img-placeholder">No Image</div>
        )}

        {discount && <span className="product-badge">-{discount}%</span>}
        {product.stock === 0 && <span className="product-badge product-badge-sold">Sold Out</span>}

        <button className={`wishlist-btn${wishlist ? ' active' : ''}`}
          onClick={e => { e.preventDefault(); setWishlist(!wishlist); }}
          aria-label="Wishlist">
          <Heart size={16} fill={wishlist ? 'currentColor' : 'none'} />
        </button>

        <button className="product-add-btn" onClick={handleAddToCart} disabled={loading || product.stock === 0}>
          <ShoppingBag size={15} /> Add to Bag
        </button>
      </Link>

      <div className="product-info">
        <div className="product-cat">{product.category?.name}</div>
        <Link to={`/product/${product.slug}`}><h3 className="product-name">{product.name}</h3></Link>
        <div className="product-price">
          {product.sale_price ? (
            <>
              <span className="price-sale">KES {product.sale_price.toLocaleString()}</span>
              <span className="price-original">KES {product.price.toLocaleString()}</span>
            </>
          ) : (
            <span>KES {product.price.toLocaleString()}</span>
          )}
        </div>
        {product.colors?.length > 0 && (
          <div className="product-colors">
            {product.colors.slice(0,4).map(c => (
              <span key={c} className="color-dot" title={c} style={{ background: colorToHex(c) }} />
            ))}
            {product.colors.length > 4 && <span style={{fontSize:'.7rem',color:'var(--gray-500)'}}>+{product.colors.length-4}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

function colorToHex(name) {
  const map = {
    'black':'#1a1a1a','white':'#f5f5f5','navy':'#1a2744','red':'#c0392b',
    'rose':'#c9867c','pink':'#e8aab5','blush':'#f0d0cc','nude':'#d4a88a',
    'beige':'#d4c4a8','cream':'#f5f0e8','ivory':'#f8f4ec','champagne':'#c8a97a',
    'gold':'#b8955a','tan':'#c8956c','camel':'#c09060','chocolate':'#7b4c2a',
    'sand':'#d4b896','sage':'#87a878','green':'#4a7c59','emerald':'#2d6a4f',
    'forest green':'#2d5a3d','blue':'#3b5bdb','dusty pink':'#c4a0a0',
    'burgundy':'#722f37','purple':'#6b3fa0','silver':'#b0b0b0','grey':'#8a8a8a',
  };
  return map[name.toLowerCase()] || '#c9867c';
}
