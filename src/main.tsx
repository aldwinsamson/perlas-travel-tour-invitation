import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { prefetchIntro, setBootProgress } from './utils/intro';

// start the 3d downloads right now, in parallel with react rendering, instead of after it
prefetchIntro();
setBootProgress(0.1);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// repeat visits open instantly from the cache. registered after load so it never competes with the intro.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
