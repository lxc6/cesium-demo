import { createBrowserRouter, Navigate } from 'react-router-dom';
import CesiumDemo from '@/pages/CesiumDemo';
import Login from '@/pages/login';
import Layout from '../layout';

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <Navigate to='/demo' replace />,
            },
            {
                path: '/demo',
                element: <CesiumDemo />,
            },
        ],
    },
]);
