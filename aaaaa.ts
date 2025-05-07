import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { loadEnv, ConfigEnv } from 'vite';

export interface ViteEnv {
    VITE_PORT: number;
    VITE_CONTEXT_PATH: string;
    VITE_SERVICE_PATH: string;
    VITE_PROXY_DOMAIN_REAL: string;
    VITE_GIS_SERVICE_PATH: string;
}
export const handleEnv = (envConf: Record<string, string>) => {
    // 此处为默认值，无需修改
    const ret: ViteEnv = {
        VITE_PORT: 8888,
        VITE_SERVICE_PATH: '',
        VITE_CONTEXT_PATH: '/',
        VITE_PROXY_DOMAIN_REAL: '',
        VITE_GIS_SERVICE_PATH: '',
    };
    Object.keys(envConf).forEach((index) => {
        switch (index) {
            case '8888':
                ret.VITE_PORT = Number(envConf[index]);
                break;
            default:
                ret[index] = envConf[index];
        }
    });
    return ret;
};

export default ({ mode }: ConfigEnv) => {
    const {
        VITE_PORT,
        VITE_CONTEXT_PATH,
        VITE_SERVICE_PATH,
        VITE_GIS_SERVICE_PATH,
        VITE_PROXY_DOMAIN_REAL,
    } = handleEnv(loadEnv(mode, resolve(__dirname, 'env')));
    const isDev = mode === 'development';
    return {
        base: VITE_CONTEXT_PATH,
        envDir: resolve(__dirname, 'env'),
        resolve: { alias: { '@': resolve(__dirname, 'src') } },
        plugins: [
            // 关闭 react 插件
            react(),
        ],

        // 跨域代理，生产环境不走这里
        server: {
            // 是否开启 https
            https: false,
            // 端口号
            port: VITE_PORT,
            host: '0.0.0.0',
            open: true, // 自动开启浏览器
            cors: true,
            // 本地跨域代理
            proxy: {
                // balance
                [VITE_SERVICE_PATH]: {
                    target: VITE_PROXY_DOMAIN_REAL,
                    changeOrigin: true,
                },
                // gis
                [VITE_GIS_SERVICE_PATH]: {
                    target: VITE_PROXY_DOMAIN_REAL,
                    changeOrigin: true,
                },
            },
        },
        build: {
            sourcemap: false,
            brotliSize: false,
            assetsDir: 'src/assets',
            rollupOptions: {
                output: {
                    // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
                    entryFileNames: 'js/[name].[hash].js',
                    // 用于命名代码拆分时创建的共享块的输出命名
                    chunkFileNames: 'js/[name].[hash].js',
                },
            },
        },
        define: {
            'process.env': {},
        },
    };
};
