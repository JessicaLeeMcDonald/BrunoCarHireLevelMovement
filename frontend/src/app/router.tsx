import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { VehicleListPage } from '../features/vehicles/pages/VehicleListPage';
import { VehicleFormPage } from '../features/vehicles/pages/VehicleFormPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/vehicles" replace /> },
      { path: 'vehicles', element: <VehicleListPage /> },
      { path: 'vehicles/new', element: <VehicleFormPage /> },
      { path: 'vehicles/:id/edit', element: <VehicleFormPage /> },
    ],
  },
]);
