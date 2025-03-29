"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button 
      onClick={handleLogout} 
      className={className || "text-sm text-gray-600 hover:text-gray-900"}
    >
      Logout
    </button>
  );
} 