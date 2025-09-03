import './App.css'
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import "./index.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "react-hot-toast";
import {AuthProvider} from "./context/authContext.tsx";
import {ThemeProvider} from "./styles/themeProvider.tsx";
import { initAuthFromStorage } from './api/http';
import { NotificationProvider } from "./composants/notification/notificationProvider.tsx";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <RouterProvider router={router} />
              <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                    },
                  }}
              />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
  );
}
initAuthFromStorage();

export default App;
