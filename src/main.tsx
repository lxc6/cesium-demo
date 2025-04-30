import React, { Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useCesiumScript } from './hooks/useCesiumScript';
import { useCesiumStore } from './store/cesium';
import '../style/global.scss';

const App = () => {
    const { loaded, error } = useCesiumScript();
    const getBaseConfig = useCesiumStore((state) => state.getBaseConfig);
    const [configLoaded, setConfigLoaded] = React.useState(false);

    useEffect(() => {
        const initConfig = async () => {
            if (loaded) {
                await getBaseConfig();
                setConfigLoaded(true);
            }
        };
        initConfig();
    }, [loaded, getBaseConfig]);

    if (error) return <div>Failed to load Cesium</div>;
    if (!loaded || !configLoaded) return <div>Loading Cesium...</div>;

    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
};

createRoot(document.getElementById('root')!).render(
    <Suspense fallback={<div>Loading...</div>}>
        <App />
    </Suspense>
);
