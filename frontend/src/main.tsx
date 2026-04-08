import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { PrimeReactProvider} from 'primereact/api';
        

import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <StrictMode>
        <PrimeReactProvider value={{ unstyled: true }}>
          <App />
        </PrimeReactProvider>
      </StrictMode>
    </AuthProvider>
  </BrowserRouter>
)