import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider as HelmetProviderBase } from 'react-helmet-async';
import { store } from './store';
import { App } from './App';
import './index.css';

const HelmetProvider = HelmetProviderBase as unknown as React.FC<React.PropsWithChildren<{ context?: any }>>;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
