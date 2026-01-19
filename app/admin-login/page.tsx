'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined') {
      // Simple password check (change this password!)
      if (password === 'Dhiraj@Gaikwad@333') {
        // Set admin token in localStorage
        localStorage.setItem('adminToken', 'certgen-admin-2024');
        router.push('/admin');
      } else {
        setError('Invalid password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Login as Admin
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Note: This page is only for administrators.</p>
          <p className="mt-2">
            After login, go to: <a href="/admin" className="text-blue-600 underline">/admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}