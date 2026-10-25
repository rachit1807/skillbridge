"use client";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : null;
}
