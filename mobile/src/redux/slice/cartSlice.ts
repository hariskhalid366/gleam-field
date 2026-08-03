import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../helpers/types";

export type CartLine = { product: Product; qty: number };
type CartState = { lines: CartLine[] };

const cartSlice = createSlice({
  name: "cart",
  initialState: { lines: [] } as CartState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; qty?: number }>) => {
      const quantity = action.payload.qty || 1;
      const line = state.lines.find((item) => item.product._id === action.payload.product._id);
      if (line) line.qty += quantity;
      else state.lines.push({ product: action.payload.product, qty: quantity });
    },
    setCartQuantity: (state, action: PayloadAction<{ id: string; qty: number }>) => {
      state.lines = action.payload.qty <= 0
        ? state.lines.filter((item) => item.product._id !== action.payload.id)
        : state.lines.map((item) => item.product._id === action.payload.id ? { ...item, qty: action.payload.qty } : item);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((item) => item.product._id !== action.payload);
    },
    clearCart: (state) => {
      state.lines = [];
    },
  },
});

export const { addToCart, clearCart, removeFromCart, setCartQuantity } = cartSlice.actions;
export default cartSlice.reducer;
