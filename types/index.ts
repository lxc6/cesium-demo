export interface SceneOptions {
	viewer?: ViewerOptions;
	terrain?: TerrainOptions;
	[key: string]: any;
}

export interface ViewerOptions {
	animation?: boolean;
	baseLayerPicker?: boolean;
	fullscreenButton?: boolean;
	geocoder?: boolean;
	homeButton?: boolean;
	infoBox?: boolean;
	sceneModePicker?: boolean;
	timeline?: boolean;
	navigationHelpButton?: boolean;
	contextOptions?: {
		webgl?: {
			alpha?: boolean;
			depth?: boolean;
			stencil?: boolean;
			antialias?: boolean;
			premultipliedAlpha?: boolean;
			preserveDrawingBuffer?: boolean;
		};
	};
	[key: string]: any;
}

export interface CameraPosition {
	longitude: number;
	latitude: number;
	height: number;
}

export interface CameraOptions extends CameraPosition {
	heading?: number;
	pitch?: number;
	roll?: number;
}

export interface FlyToOptions {
	position: CameraPosition;
	heading?: number;
	pitch?: number;
	roll?: number;
	duration?: number;
}

export interface TerrainOptions {
	url?: string;
	requestVertexNormals?: boolean;
	requestWaterMask?: boolean;
}
