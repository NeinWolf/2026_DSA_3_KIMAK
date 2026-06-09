"use client";

import { useState, useEffect } from "react";
import TimeTrackingLayout, { User } from "@/components/time-tracking-layout";
import LoginPage from "@/components/login-page";
import { Loader2 } from "lucide-react";
import { isTokenValid } from "@/lib/api";

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    // Attempt to restore user session from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      if (isTokenValid(storedToken)) {
        try {
          const user = JSON.parse(storedUser) as User;
          setCurrentUser(user);
        } catch (err) {
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } else {
        // Token is invalid/expired
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setIsRestoring(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Przywracanie sesji...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return <TimeTrackingLayout currentUser={currentUser} onLogout={handleLogout} />;
}
