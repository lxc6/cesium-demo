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



export enum FeatureAttrType {
	LINE = 'l',
	POINT = 'p',
	OTHER = 'o',
	MODEL = 'm',
}

export interface CombinedAttribute {
	SMID: string;
	SMUSERID: string;
	SMLIBTILEID: string;
	GIS_NAME: string;
	GIS_CODE: string;
	颜色: string;
	备注: string;
	水种: string;
}

export interface PointAttribute extends CombinedAttribute {
	FLOW_TYPE: string;
	GIS_APPENDAGE_CODE: string;
	GIS_POINT_TYPE: string;
	SMX: string;
	SMY: string;
	X: string;
	Y: string;
	图幅号: string;
	地面高程: string;
	埋深: string;
	接边点点号: string;
	是否接边点: string;
	水种代码: string;
	流向类型: string;
	点符号编码: string;
	点编码: string;
	物探点号: string;
	特征: string;
	角度: string;
	设备位号: string;
	道路名称: string;
	附属物: string;
	附属物代码: string;
	附属物编号: string;
	高程: string;
}

export interface LineAttribute extends CombinedAttribute {
	SMKEY: string;
	SMSDRIW: string;
	SMSDRIN: string;
	SMSDRIE: string;
	SMSDRIS: string;
	SMGRANULE: string;
	SMGEOMETRY: string;
	SMLENGTH: string;
	SMTOPOERROR: string;
	代码: string;
	线符号: string;
	线宽度: string;
	起始点号: string;
	终止点号: string;
	起点埋深: string;
	终点埋深: string;
	起点高程: string;
	终点高程: string;
	埋设方式: string;
	材质: string;
	管径: string;
	壁厚: string;
	线型: string;
	保护材料: string;
	管段间距: string;
	权属单位: string;
	建设年代: string;
	道路名称: string;
	压力: string;
	电压: string;
	电缆条数: string;
	总孔数: string;
	已用孔数: string;
	孔径: string;
	载体: string;
}

export interface ModelAttribute extends CombinedAttribute {
	CATEGORYNAME: string;
	SURFACEAREA: string;
}

export type FeatureAttribute<T> = T extends FeatureAttrType.LINE
	? LineAttribute
	: T extends FeatureAttrType.POINT
	? PointAttribute
	: T extends FeatureAttrType.MODEL
	? ModelAttribute
	: Record<string, string>;
