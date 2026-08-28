import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { HomePage } from '../features/home/pages/HomePage';
import { VehicleListPage } from '../features/vehicles/pages/VehicleListPage';
import { VehicleFormPage } from '../features/vehicles/pages/VehicleFormPage';
import { CustomerListPage } from '../features/customers/pages/CustomerListPage';
import { CustomerFormPage } from '../features/customers/pages/CustomerFormPage';
import { BookingListPage } from '../features/bookings/pages/BookingListPage';
import { BookingFormPage } from '../features/bookings/pages/BookingFormPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'vehicles', element: <VehicleListPage /> },
      { path: 'vehicles/new', element: <VehicleFormPage /> },
      { path: 'vehicles/:id/edit', element: <VehicleFormPage /> },
      { path: 'customers', element: <CustomerListPage /> },
      { path: 'customers/new', element: <CustomerFormPage /> },
      { path: 'customers/:id/edit', element: <CustomerFormPage /> },
      { path: 'bookings', element: <BookingListPage /> },
      { path: 'bookings/new', element: <BookingFormPage /> },
    ],
  },
]);
