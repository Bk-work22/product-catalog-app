import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
  dialogOpen: boolean;
  title: string;
  image: string;
  category: string;
  price: string;
  availability: boolean;
  description: string;
}

const initialState: FormState = {
  dialogOpen: false,
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
      state.title = "";
      state.image = "";
      state.category = "";
      state.price = "";
      state.availability = true;
      state.description = "";
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
} = formSlice.actions;
export default formSlice.reducer;

