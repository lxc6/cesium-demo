/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PROXY_DOMAIN_REAL: string;
    // 在这里添加其他环境变量
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
