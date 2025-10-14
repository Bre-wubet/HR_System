import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from './lib/react-query';
import useAuthStore from './stores/useAuthStore';
import { LayoutProvider } from './components/layout';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize authentication state from localStorage
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <LayoutProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </LayoutProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </Router>
    </QueryClientProvider>
  );
}

export default App;