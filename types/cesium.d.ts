declare module 'cesium' {
    const Cesium: any;

    interface Scene {
        undergroundMode: boolean;
        open: (
            url: string,
            sceneName?: string,
            options?: AnyObject
        ) => Promise<Array<any>>;
        layers: any;
        addS3MTilesLayerByScp: any;
        multiViewportMode: number;
    }

    export = Cesium;
}
