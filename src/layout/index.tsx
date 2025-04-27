import { NavLink, Outlet } from 'react-router-dom';
import './index.scss';

const Layout = () => {
	return (
		<div className='layout-container'>
			<nav>
				<NavLink
					to='/demo'
					className={({ isActive }) => (isActive ? 'active' : '')}
				>
					Cesium Demo
				</NavLink>
			</nav>
			<div className='layout-container-center'>
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
