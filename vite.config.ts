import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
	plugins: [react(), dts({ rollupTypes: true })],
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	server: {
		port: 8085,
		open: true,
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'CesiumReactTools',
			formats: ['es', 'umd'],
			fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'cesium'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					cesium: 'Cesium',
				},
			},
		},
	},
});
