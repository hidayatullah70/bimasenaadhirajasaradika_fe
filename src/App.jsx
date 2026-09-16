import React from 'react';
import { AuthProvider } from './app/context/AuthContext';
import { ToastProvider } from './app/context/ToastContext';
import { AppRouter } from './app/router/AppRouter';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
