import axios from 'axios';

const BASE_URL = 'https://danis-choice-website-3.onrender.com/api';
console.log("CURRENT API URL:", BASE_URL);
const api = axios.create({ baseURL: BASE_URL });

console.log("ENV:", import.meta.env);


api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('dc_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config;
    const status   = err.response?.status;

    // Handle both 401 (expired) and 422 (missing/malformed token)
    if ((status === 401 || status === 422) && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('dc_refresh');

      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refresh}` }
          });
          const newToken = res.data.data.access_token;
          localStorage.setItem('dc_token', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch {
          // Refresh failed — clear everything and redirect to login
          localStorage.removeItem('dc_token');
          localStorage.removeItem('dc_refresh');
          localStorage.removeItem('dc_user');
          window.location.href = '/login';
        }
      } else {
        // No refresh token — clear stale data silently
        localStorage.removeItem('dc_token');
        localStorage.removeItem('dc_user');
      }
    }

    return Promise.reject(err.response?.data?.message || 'Something went wrong');
  }
);

export default api;

export const authService = {
  register: d => api.post('/auth/register', d),
  login:    d => api.post('/auth/login', d),
  me:       () => api.get('/auth/me'),
  updateProfile: d => api.put('/auth/profile', d),
};

export const productService = {
  getAll:        params  => api.get('/products', { params }),
  getById:       id      => api.get(`/products/${id}`),
  getBySlug:     slug    => api.get(`/products/slug/${slug}`),
  getCategories: ()      => api.get('/products/categories'),
  create:        d       => api.post('/products', d),
  update:        (id, d) => api.put(`/products/${id}`, d),
  delete:        id      => api.delete(`/products/${id}`),
};

export const cartService = {
  get:    ()   => api.get('/cart'),
  add:    d    => api.post('/cart/add', d),
  update: d    => api.put('/cart/update', d),
  remove: id   => api.delete(`/cart/remove?item_id=${id}`),
  clear:  ()   => api.delete('/cart/clear'),
};

export const orderService = {
  create:       d        => api.post('/orders', d),
  getAll:       p        => api.get('/orders', { params: p }),
  getById:      id       => api.get(`/orders/${id}`),
  adminAll:     p        => api.get('/orders/admin/all', { params: p }),
  updateStatus: (id, s)  => api.patch(`/orders/${id}/status`, { status: s }),
};

export const adminService = {
  dashboard:  ()   => api.get('/admin/dashboard'),
  customers:  p    => api.get('/admin/customers', { params: p }),
  toggleUser: id   => api.patch(`/admin/customers/${id}/toggle`),
};

export const uploadService = {
  upload: file => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};