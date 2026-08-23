import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
            maxWidth: 'calc(100vw - 32px)',
          },
          success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </ErrorBoundary>
  );
}
