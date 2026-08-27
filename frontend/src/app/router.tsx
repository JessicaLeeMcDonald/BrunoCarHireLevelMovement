import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { VehicleListPage } from '../features/vehicles/pages/VehicleListPage';
import { VehicleFormPage } from '../features/vehicles/pages/VehicleFormPage';
import { CustomerListPage } from '../features/customers/pages/CustomerListPage';
import { CustomerFormPage } from '../features/customers/pages/CustomerFormPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/vehicles" replace /> },
      { path: 'vehicles', element: <VehicleListPage /> },
      { path: 'vehicles/new', element: <VehicleFormPage /> },
      { path: 'vehicles/:id/edit', element: <VehicleFormPage /> },
      { path: 'customers', element: <CustomerListPage /> },
      { path: 'customers/new', element: <CustomerFormPage /> },
      { path: 'customers/:id/edit', element: <CustomerFormPage /> },
    ],
  },
]);
