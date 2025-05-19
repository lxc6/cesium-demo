export enum GetFeatureMode {
    BOUNDS = 'BOUNDS',
    // 通过范围查询来获取要素。
    BOUNDS_ATTRIBUTEFILTER = 'BOUNDS_ATTRIBUTEFILTER',
    // 通过范围查询加属性过滤器的模式来获取要素。
    BUFFER = 'BUFFER',
    // 通过几何对象的缓冲区来获取要素。
    BUFFER_ATTRIBUTEFILTER = 'BUFFER_ATTRIBUTEFILTER',
    // 通过缓冲区加属性过滤器的模式来获取要素。
    ID = 'ID',
    // 通过 ID 来获取要素。
    SPATIAL = 'SPATIAL',
    // 通过空间查询模式来获取要素。
    SPATIAL_ATTRIBUTEFILTER = 'SPATIAL_ATTRIBUTEFILTER',
    // 通过空间查询加属性过滤器的模式来获取要素。
    SQL = 'SQL'
    // 通过 SQL 查询来获取要素。
}

export interface Point {
    x: number;
    y: number;
}

export interface Requester {
    getFeatureMode: GetFeatureMode;

    datasetNames: string[];
    // 如果getFeatureMode为ID, 则ids必填
    ids?: number[];

    [key: string]: unknown;
}

export interface Response<F> {
    featureCount: number;
    featureUriList: string[];
    features: F[];
    totalCount: number;
}

export interface RawFeature {
    ID: number;
    fieldNames: string[];
    fieldValues: string[];
    geometry: {
        center: Point;
        parts: [number];
        type: string;
        points: Point[];
    };
    stringID?: string;
}

export interface Processed<A> {
    ID: number;
    attribute: A;
    geometry: {
        center: Point;
        parts: [number];
        type: string;
        points: Point[];
    };
    stringID?: string;
}

export interface Points {
    x: number;
    y: number;
    type?: string;
    geometryType?: string;
}

export interface SuperMapQueryGeometry {
    style: unknown;
    parts: number[];
    points: Points[];
    partTopo?: number[];
    type: string;
    prjCoordSys: Record<string, unknown>;
}
