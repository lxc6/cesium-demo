// 检查有无全局对象，没有则创建
export function checkCesium(baseUrl: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if (window.Cesium) {
			resolve(true);
			return;
		}
		const script = document.createElement('script');
		script.src = `${baseUrl}/Cesium.js`;
		script.onload = () => {
			resolve(true);
		};
		script.onerror = () => {
			reject(new Error('Cesium is not load'));
		};
		document.body.appendChild(script);
	});
}

// 加载样式表
export function createStyle(baseUrl: string) {
	let link: HTMLLinkElement | null =
		document.querySelector('link.cesium-style');
	return new Promise((resolve) => {
		if (!link) {
			link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = `${baseUrl}/Widgets/widgets.css`;
			document.head.appendChild(link);
			link.onload = () => {
				resolve(true);
			};
		} else {
			resolve(true);
		}
	});
}

// // 创建一个基础三维场景
// export async function createBaseCesiumView(
// 	container: Element,
// 	CESIUM_BASE_URL = '/cesium/'
// ) {
// 	window['CESIUM_BASE_URL'] = CESIUM_BASE_URL;
// 	await Promise.all([
// 		checkCesium(CESIUM_BASE_URL),
// 		createStyle(CESIUM_BASE_URL),
// 	]);
// 	return new BaseCesiumScene(container);
// }
