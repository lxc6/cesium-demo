import { useEffect, useState } from 'react';

export const useCesiumScript = (url: string = 'http://3d.dev.tech/cesium/Cesium.js') => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (window.Cesium) {
            setLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        script.onload = () => {
            setLoaded(true);
        };

        script.onerror = () => {
            setError(new Error('Failed to load Cesium'));
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [url]);

    return { loaded, error };
}; 