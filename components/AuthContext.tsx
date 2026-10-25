"use client";
import { createContext, useContext } from "react";
export type UserT = { id: string; name: string; email: string };
export const AuthContext = createContext<{ user: UserT | null }>({
  user: null,
});
export const useAuth = () => useContext(AuthContext);
