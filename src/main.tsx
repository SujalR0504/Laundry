import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { BusinessProvider } from './business/BusinessContext';
import { ImportProvider } from './business/ImportContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <BusinessProvider>
        <ImportProvider>
          <AppContent />
        </ImportProvider>
      </BusinessProvider>
    </AppProvider>
  </React.StrictMode>
);
