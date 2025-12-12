import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  // Get all products
  getAll: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
  }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  },

  // Get product by ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch product');
    }
  },

  // Create product
  create: async (productData: {
    title: string;
    image: string;
    category: string;
    price: number;
    availability: boolean;
    description: string;
  }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  },

  // Update product
  update: async (id: string, productData: {
    title?: string;
    image?: string;
    category?: string;
    price?: number;
    availability?: boolean;
    description?: string;
  }) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update product');
    }
  },

  // Delete product
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete product');
    }
  },
};

// Upload API
export const uploadAPI = {
  // Upload image to Cloudinary
  uploadImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to upload image');
    }
  },
};
