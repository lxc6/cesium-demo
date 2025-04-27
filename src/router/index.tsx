import { createBrowserRouter, Navigate } from 'react-router-dom';
import CesiumDemo from '../pages/CesiumDemo';
import Layout from '../layout';

export const router = createBrowserRouter([
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
