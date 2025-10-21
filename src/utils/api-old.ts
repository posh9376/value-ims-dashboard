import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// Types for API responses
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'cashier';
  id_card_number: string;
  is_active: boolean;
  is_staff: boolean;
}

export interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

export interface School {
  id: number;
  name: string;
  location: string;
}

export interface UniformType {
  id: number;
  name: string;
}

export interface Size {
  id: number;
  label: string;
}

export interface Inventory {
  id: number;
  school: number;
  school_details: School;
  variant: string;
  size: number;
  size_details: Size;
  b_price: string;
  s_price: string;
  quantity: number;
  minimum_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  date: string;
  customer_name?: string;
  total_amount: string;
  sold_by: number;
}

export interface SaleItem {
  id: number;
  sale: number;
  stock: number;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface DashboardData {
  today_sales: number;
  today_orders: number;
  month_sales: number;
  month_orders: number;
  month_growth: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_schools: number;
  total_inventory_items: number;
}

export interface MonthlySalesData {
  month: string;
  sales: number;
  orders: number;
}

export interface InventorySummary {
  total_items: number;
  in_stock: number;
  low_stock: number;
  out_of_stock: number;
  total_value: number;
  top_variants: Array<{
    variant: string;
    quantity: number;
    avg_price: number;
  }>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Class
class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${this.baseURL}/auth/token/refresh/`, {
                refresh: refreshToken
              });
              
              const { access } = response.data;
              localStorage.setItem('access_token', access);
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async login(username: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login/', {
      username,
      password
    });
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await this.api.post('/auth/logout/', {
        refresh: refreshToken
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage regardless of API response
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async getUserProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/profile/');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/auth/profile/update/', data);
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
    return response.data;
  }

  // Analytics Methods
  async getDashboardData(): Promise<DashboardData> {
    const response: AxiosResponse<DashboardData> = await this.api.get('/analytics/dashboard/');
    return response.data;
  }

  async getMonthlySales(): Promise<MonthlySalesData[]> {
    const response: AxiosResponse<MonthlySalesData[]> = await this.api.get('/analytics/monthly-sales/');
    return response.data;
  }

  async getInventorySummary(): Promise<InventorySummary> {
    const response: AxiosResponse<InventorySummary> = await this.api.get('/analytics/inventory-summary/');
    return response.data;
  }

  async getLowStockAlerts() {
    const response = await this.api.get('/analytics/low-stock-alerts/');
    return response.data;
  }

  // School Methods
  async getSchools(): Promise<School[]> {
    const response: AxiosResponse<School[]> = await this.api.get('/stock/schools');
    return response.data;
  }

  async createSchool(school: Omit<School, 'id'>): Promise<School> {
    const response: AxiosResponse<School> = await this.api.post('/stock/schools', school);
    return response.data;
  }

  async updateSchool(id: number, school: Partial<School>): Promise<School> {
    const response: AxiosResponse<School> = await this.api.put(`/stock/schools/${id}`, school);
    return response.data;
  }

  async deleteSchool(id: number): Promise<void> {
    await this.api.delete(`/stock/schools/${id}`);
  }

  // Uniform Types Methods
  async getUniformTypes(): Promise<UniformType[]> {
    const response: AxiosResponse<UniformType[]> = await this.api.get('/stock/categories');
    return response.data;
  }

  async createUniformType(type: Omit<UniformType, 'id'>): Promise<UniformType> {
    const response: AxiosResponse<UniformType> = await this.api.post('/stock/categories', type);
    return response.data;
  }

  // Size Methods
  async getSizes(): Promise<Size[]> {
    const response: AxiosResponse<Size[]> = await this.api.get('/stock/sizes');
    return response.data;
  }

  async createSize(size: Omit<Size, 'id'>): Promise<Size> {
    const response: AxiosResponse<Size> = await this.api.post('/stock/sizes', size);
    return response.data;
  }

  async updateSize(id: number, size: Partial<Size>): Promise<Size> {
    const response: AxiosResponse<Size> = await this.api.put(`/stock/sizes/${id}`, size);
    return response.data;
  }

  async deleteSize(id: number): Promise<void> {
    await this.api.delete(`/stock/sizes/${id}`);
  }

  // Inventory Methods
  async getInventory(params?: {
    search?: string;
    school?: number;
    variant?: string;
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    ordering?: string;
    page?: number;
  }): Promise<PaginatedResponse<Inventory>> {
    const response: AxiosResponse<PaginatedResponse<Inventory>> = await this.api.get('/stock/stock', {
      params
    });
    return response.data;
  }

  async createInventoryItem(item: Omit<Inventory, 'id' | 'school_details' | 'size_details' | 'created_at' | 'updated_at'>): Promise<Inventory> {
    const response: AxiosResponse<Inventory> = await this.api.post('/stock/stock', item);
    return response.data;
  }

  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory> {
    const response: AxiosResponse<Inventory> = await this.api.put(`/stock/stock/${id}`, item);
    return response.data;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await this.api.delete(`/stock/stock/${id}`);
  }

  // Sales Methods
  async getSales(): Promise<Sale[]> {
    const response: AxiosResponse<Sale[]> = await this.api.get('/stock/sale/');
    return response.data;
  }

  async createSale(sale: Omit<Sale, 'id' | 'date' | 'total_amount'>): Promise<Sale> {
    const response: AxiosResponse<Sale> = await this.api.post('/stock/sale/', sale);
    return response.data;
  }

  async getSaleItems(): Promise<SaleItem[]> {
    const response: AxiosResponse<SaleItem[]> = await this.api.get('/stock/sale-items/');
    return response.data;
  }

  async createSaleItem(item: Omit<SaleItem, 'id' | 'line_total'>): Promise<SaleItem> {
    const response: AxiosResponse<SaleItem> = await this.api.post('/stock/sale-items/', item);
    return response.data;
  }

  // User Methods
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users/users/');
    return response.data;
  }

  async createUser(user: Omit<User, 'id'> & { password: string }): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users/users/', user);
    return response.data;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/users/${id}/`, user);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/users/${id}/`);
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
