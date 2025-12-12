import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import formReducer from './slices/formSlice';
import filtersReducer from './slices/filtersSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    form: formReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

