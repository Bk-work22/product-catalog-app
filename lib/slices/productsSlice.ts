import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id?: string | number;
  _id?: string;
  title: string;
  name?: string;
  image: string;
  category: string;
  price: number;
  availability: boolean;
  slug: string;
  description: string;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  initialLoading: boolean; // Only true on first load
  error: string | null;
}

const initialState: ProductsState = {
  items: [
    { id: 1, title: "Product 1", name: "Product 1", price: 29.99, image: "https://via.placeholder.com/300", category: "Clothing", availability: true, slug: "product-1", description: "" },
    { id: 2, title: "Product 2", name: "Product 2", price: 49.99, image: "https://via.placeholder.com/300", category: "Shoes", availability: true, slug: "product-2", description: "" },
    { id: 3, title: "Product 3", name: "Product 3", price: 79.99, image: "https://via.placeholder.com/300", category: "Accessories", availability: true, slug: "product-3", description: "" },
    { id: 4, title: "Product 4", name: "Product 4", price: 99.99, image: "https://via.placeholder.com/300", category: "Electronics", availability: true, slug: "product-4", description: "" },
    { id: 5, title: "Product 5", name: "Product 5", price: 129.99, image: "https://via.placeholder.com/300", category: "Clothing", availability: true, slug: "product-5", description: "" },
    { id: 6, title: "Product 6", name: "Product 6", price: 159.99, image: "https://via.placeholder.com/300", category: "Shoes", availability: true, slug: "product-6", description: "" },
  ],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Omit<Product, 'id'>>) => {
      const newId = state.items.length > 0 
        ? Math.max(...state.items.map(p => typeof p.id === 'number' ? p.id : 0)) + 1 
        : 1;
      state.items.push({ ...action.payload, id: newId });
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    setProducts: (state, action: PayloadAction<any[]>) => {
      // Transform MongoDB documents to Product format
      state.items = action.payload.map((item) => ({
        ...item,
        id: item._id || item.id,
      }));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addProduct, updateProduct, deleteProduct, setProducts, setLoading, setError } = productsSlice.actions;
export default productsSlice.reducer;

