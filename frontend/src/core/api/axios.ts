import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1', // Hardcoded temporarily because Vite requires restart for .env changes
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId'); // Should be extracted from subdomain or user selection
    const userStr = localStorage.getItem('user');
    let branchId = null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Assuming useAuth sets currentBranch in context, but here we can grab it from user defaults or rely on Context to set it
        // If currentBranch is stored separately:
        branchId = localStorage.getItem('currentBranchId') || (user.branches && user.branches.length > 0 ? user.branches[0].branchId : null);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    if (branchId) {
      config.headers['x-branch-id'] = branchId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const tenantId = localStorage.getItem('tenantId');
        
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }, {
          headers: { 'x-tenant-id': tenantId }
        });

        const newToken = data.data.token;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response && error.response.status === 403) {
      const errCode = error.response.data?.code;
      if (errCode === 'SUBSCRIPTION_EXPIRED' || errCode === 'ACCOUNT_FROZEN') {
        window.dispatchEvent(new CustomEvent('erp:account-frozen', {
          detail: {
            code: errCode,
            message: error.response.data?.message || 'Your school account subscription or trial has expired.',
            status: error.response.data?.status || 'EXPIRED'
          }
        }));
      }
      console.error('Forbidden access', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
