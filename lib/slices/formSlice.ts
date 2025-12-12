import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
  dialogOpen: boolean;
  editingProductId: string | null;
  title: string;
  image: string;
  category: string;
  price: string;
  availability: boolean;
  description: string;
}

const initialState: FormState = {
  dialogOpen: false,
  editingProductId: null,
  title: "",
  image: "",
  category: "",
  price: "",
  availability: true,
  description: "",
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.dialogOpen = action.payload;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setImage: (state, action: PayloadAction<string>) => {
      state.image = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setPrice: (state, action: PayloadAction<string>) => {
      state.price = action.payload;
    },
    setAvailability: (state, action: PayloadAction<boolean>) => {
      state.availability = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    resetForm: (state) => {
      state.editingProductId = null;
      state.title = "";
      state.image = "";
      state.category = "";
      state.price = "";
      state.availability = true;
      state.description = "";
    },
    setEditingProduct: (state, action: PayloadAction<{
      id: string;
      title: string;
      image: string;
      category: string;
      price: number;
      availability: boolean;
      description: string;
    }>) => {
      state.editingProductId = action.payload.id;
      state.title = action.payload.title;
      state.image = action.payload.image;
      state.category = action.payload.category;
      state.price = action.payload.price.toString();
      state.availability = action.payload.availability;
      state.description = action.payload.description;
    },
  },
});

export const {
  setDialogOpen,
  setTitle,
  setImage,
  setCategory,
  setPrice,
  setAvailability,
  setDescription,
  resetForm,
  setEditingProduct,
} = formSlice.actions;
export default formSlice.reducer;

