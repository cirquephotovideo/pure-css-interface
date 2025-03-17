import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Catalogs from '@/pages/Catalogs';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import ResetRailwayDB from '@/pages/ResetRailwayDB';

// We just need to update the router configuration to include our new ResetRailwayDB page
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Index />
      },
      {
        path: "/catalogs",
        element: <Catalogs />
      },
      {
        path: "/settings",
        element: <Settings />
      },
      {
        path: "/reset-railway-db",
        element: <ResetRailwayDB />
      }
    ]
  }
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
