/// <reference types="cesium" />

declare namespace Cesium {
    export * from 'cesium';
    // export interface Viewer {}
    export interface Scene {
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
    export const knockout: any;
    export const SuperMapImageryProvider: any;

    export const DynamicLayer3D: any;

    export let HypsometricSettingEnum: any;

    export interface ExcavationRegionOptions {
        // 开挖区域位置信息。
        position: number[];
        // 开挖区域名称。
        name: string;
        // 开挖地下深度。
        height: string | number;
        // 地表是否透明。
        transparent: boolean;
        // 用于指定开挖纹理的贴图方式，默认值为Cesium.TextureWrap.REPEAT。
        TextureWrap?: any;
    }

    export interface Globe {
        globeAlpha: number;
        addExcavationRegion(options: ExcavationRegionOptions): boolean;
        // 移除所有
        removeAllExcavationRegion(): void;
        // 移除指定区域
        removeExcavationRegio(name: string): void;
        [propName: string]: any;
    }

    export const MemoryManager: {
        showMemoryInfo: (a: boolean) => void;
        setMaxMemory: (s: number) => void;
    };

    export const MeasureMode = {
        Distance: 0,
        Area: 1,
        DVH: 2,
        DVHX: 3,
    };
    export const MultiViewportMode = {
        NONE: 0,
        HORIZONTAL: 1,
        VERTICAL: 2,
        QUAD: 3,
        TRIPLE: 4,
        VerticalTrisection: 5,
        FIVE_DIVISIONS: 6,
        SIX_DIVISIONS: 7,
        SEVEN_DIVISIONS: 8,
        EIGHT_DIVISIONS: 9,
        NINE_DIVISIONS: 10,
    };

    export class MeasureHandler {
        activeEvt: Event;

        //贴对象模式
        clampMode: any;

        //当量测模式为Area,利用此标签实体对象 areaLabel 来显示面积量算结果。
        areaLabel: any;
        // 当量测模式为DVH,高度,利用此标签实体对象 hLabel 来显示水平距离量算结果。
        hLabel: any;
        //当量测模式为Distance,距离,利用此标签实体对象disLabel来显示空间距离量算结果。
        disLabel: any;
        //当量测模式为DVH或Height,利用此标签实体对象 vLabel 来显示垂直高度量算结果。
        vLabel: any;

        measureEvt: Event;

        constructor(
            viewer: Viewer,
            mode: keyof MeasureMode,
            clampMode?: number
        );
        activate(): void;
        clear(): void;
        deactivate(): void;
    }
    export class Profile {
        _textureHeight: number;
        _textureWidth: number;
        build() {
            throw new Error('Method not implemented.');
        }
        getBuffer(arg0: (buffer: any) => void) {
            throw new Error('Method not implemented.');
        }
        startPoint: number[];
        endPoint: number[];
        extendHeight: number;
        constructor(scene: Object);

        destroy(): void;
    }

    export enum DrawMode {
        Box,
        Line,
        Marker,
        Point,
        Polygon,
    }

    export enum ClampMode {
        Ground,
        Raster,
        S3mModel,
        Space,
    }

    export class DrawHandler {
        // 激活事件
        activeEvt: Event;
        // 绘制期间鼠标移动
        movingEvt: Event;
        // 绘制完成
        drawEvt: Event;

        isDrawing: boolean;
        enableDepthTest: boolean;

        polygon: AnyObject;
        polyline: AnyObject;
        constructor(viewer: Viewer, mode: DrawMode, clampMode: number);
        // 激活handler。
        activate();
        // 清除所有图元。
        clear();
        // 使handler无效。
        deactivate();
    }

    export const HypsometricSetting: any;
}

declare module 'cesium' {
    export interface Scene {
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
}
