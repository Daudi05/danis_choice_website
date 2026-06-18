import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/Shop.css';

const SORT_OPTIONS = [
  { value:'newest',     label:'Newest' },
  { value:'price_asc',  label:'Price: Low to High' },
  { value:'price_desc', label:'Price: High to Low' },
  { value:'name',       label:'Name A-Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [pagination, setPagination] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // Always read filters from URL so browser back/forward works
  const filters = {
    category:  searchParams.get('category')  || '',
    search:    searchParams.get('search')    || '',
    sort:      searchParams.get('sort')      || 'newest',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    page:      parseInt(searchParams.get('page') || '1'),
  };

  useEffect(() => {
    productService.getCategories()
      .then(r => setCategories(r.data.data))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category)  params.category  = filters.category;
      if (filters.search)    params.search    = filters.search;
      if (filters.sort)      params.sort      = filters.sort;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      params.page = filters.page;

      const res = await productService.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {}
    finally { setLoading(false); }
  }, [searchParams]); // re-run whenever URL params change

  useEffect(() => { load(); }, [load]);

  // Update URL params instead of local state
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const activeFilters = [filters.category, filters.search, filters.min_price, filters.max_price].filter(Boolean).length;

  return (
    <div className="shop-page" style={{ paddingTop: 68 }}>
      {/* Header */}
      <div className="shop-header">
        <div className="container shop-header-inner">
          <div>
            <h1 className="shop-title">
              {filters.category
                ? categories.find(c => c.slug === filters.category)?.name || 'Collection'
                : 'All Collections'}
            </h1>
            {pagination && <p className="shop-count">{pagination.total} pieces</p>}
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowFilter(!showFilter)}>
              <SlidersHorizontal size={15}/> Filters
              {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
            </button>
            <div className="sort-select-wrap">
              <select className="sort-select" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14}/>
            </div>
          </div>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${showFilter ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Filter</h3>
            {activeFilters > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <X size={14}/> Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="filter-section">
            <div className="filter-title">Search</div>
            <div style={{position:'relative'}}>
              <input className="form-input" placeholder="Search products…"
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)} />
              <Search size={14} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--gray-300)'}}/>
            </div>
          </div>

          {/* Category */}
          <div className="filter-section">
            <div className="filter-title">Category</div>
            <div className="filter-options">
              <button
                className={`filter-opt ${!filters.category ? 'active' : ''}`}
                onClick={() => setFilter('category', '')}>
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`filter-opt ${filters.category === c.slug ? 'active' : ''}`}
                  onClick={() => setFilter('category', c.slug)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-section">
            <div className="filter-title">Price Range (KES)</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <input className="form-input" placeholder="Min" type="number"
                value={filters.min_price}
                onChange={e => setFilter('min_price', e.target.value)} />
              <input className="form-input" placeholder="Max" type="number"
                value={filters.max_price}
                onChange={e => setFilter('max_price', e.target.value)} />
            </div>
          </div>
        </aside>

        {/* Products */}
        <main className="shop-products">
          {loading ? (
            <div className="page-loader"><div className="spinner"/><span>Loading collection…</span></div>
          ) : products.length === 0 ? (
            <div style={{textAlign:'center',padding:'80px 0',color:'var(--gray-500)'}}>
              <div style={{fontSize:'3rem',marginBottom:12}}>🛍️</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="shop-grid">
              {products.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm"
                disabled={!pagination.has_prev}
                onClick={() => setFilter('page', filters.page - 1)}>
                Previous
              </button>
              <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
              <button className="btn btn-outline btn-sm"
                disabled={!pagination.has_next}
                onClick={() => setFilter('page', filters.page + 1)}>
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}