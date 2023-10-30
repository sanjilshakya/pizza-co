import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import cartRecucer from "./features/cart/cartSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartRecucer,
  },
});

export default store;
