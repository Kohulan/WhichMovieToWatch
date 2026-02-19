import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';

import '@fontsource-variable/inter-tight';

import './styles/app.css';
import App from './App';
import { HomePage } from './pages/HomePage';
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
      { index: true, element: <HomePage /> },
      { path: 'discover', element: <DiscoverPage /> },
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
