import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  searchQuery: string;
  selectedCategories: string[];
  priceRange: number[];
  sortBy: string | null;
}

const initialState: FiltersState = {
  searchQuery: "",
  selectedCategories: [],
  priceRange: [0],
  sortBy: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleCategory: (state, action: PayloadAction<string>) => {
      const index = state.selectedCategories.indexOf(action.payload);
      if (index === -1) {
        state.selectedCategories.push(action.payload);
      } else {
        state.selectedCategories.splice(index, 1);
      }
    },
    setPriceRange: (state, action: PayloadAction<number[]>) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string | null>) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = "";
      state.selectedCategories = [];
      state.priceRange = [0];
      state.sortBy = null;
    },
  },
});

export const {
  setSearchQuery,
  toggleCategory,
  setPriceRange,
  setSortBy,
  resetFilters,
} = filtersSlice.actions;
export default filtersSlice.reducer;

