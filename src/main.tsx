import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';

import '@fontsource/righteous';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

import './styles/app.css';
import App from './App';
import { Showcase } from './pages/Showcase';
import { DiscoverPage } from './pages/DiscoverPage';
import TrendingPage from './pages/TrendingPage';
import DinnerTimePage from './pages/DinnerTimePage';
import FreeMoviesPage from './pages/FreeMoviesPage';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DiscoverPage /> },
      { path: 'trending', element: <TrendingPage /> },
      { path: 'dinner-time', element: <DinnerTimePage /> },
      { path: 'free-movies', element: <FreeMoviesPage /> },
      { path: 'showcase', element: <Showcase /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
