/**
 * 查询超图资源
 * 文档地址：http://support.supermap.com.cn/DataWarehouse/WebDocHelp/iServer/index.htm
 */
import { Geometry } from '@turf/turf';
import { GetFeatureMode, Requester, FeatureAttrType } from './types';
import { convertGeometry } from './convert';
import { parsing } from './parsing';
import { useCesiumStore } from '@/store/cesium';

// 用于取消发送的请求
export class FeatureController<G extends Geometry = Geometry> {
	dataUrl;

	abortController = new AbortController();

	requesting = false;

	constructor() {
		const { baseConfig } = useCesiumStore.getState();
		if (!baseConfig) {
			console.error('初始化三维配置项出错');
			return;
		}
		this.dataUrl = `${baseConfig.supermapIserverUrl}/iserver/services/${baseConfig.sm3dRvtDataService}/rest/data/featureResults.json?returnContent=true`;
	}

	cancel() {
		if (this.requesting) {
			this.abortController.abort();
			this.abortController = new AbortController();
		}
	}

	// 超图空间查询接口封装， geometry并没有完全定义 如需使用自行添加
	getFeatureBySpatial<A extends FeatureAttrType>(
		datasetNames: string[],
		geometry: G,
		query?: Record<string, unknown>,
		param?: Partial<Requester>
	) {
		return this.query<A>(
			{
				datasetNames,
				getFeatureMode: GetFeatureMode.SPATIAL,
				geometry: convertGeometry(geometry),
				spatialQueryMode: 'INTERSECT',
				targetEpsgCode: 4326,
				...param,
			},
			query
		);
	}

	// 缓冲区查询
	getFeatureByBuffer<A extends FeatureAttrType = FeatureAttrType.LINE>(
		datasetNames: string[],
		geometry: G,
		bufferDistance: number,
		param?: Partial<Requester>,
		query?: Record<string, unknown>
	) {
		return this.query<A>(
			{
				datasetNames,
				getFeatureMode: GetFeatureMode.BUFFER,
				geometry: convertGeometry(geometry),
				targetEpsgCode: 4326,
				bufferDistance,
				...param,
			},
			query
		);
	}

	// 用于超图数据服务的查询
	// 文档地址：http://support.supermap.com.cn/DataWarehouse/WebDocHelp/iServer/index.htm
	query<A extends FeatureAttrType = FeatureAttrType.LINE>(
		param: Requester,
		query?: Record<string, unknown>
	) {
		let url = this.dataUrl;
		if (query) {
			const paramsArray: string[] = [];
			// 拼接参数
			Object.keys(query).forEach((key) =>
				paramsArray.push(`${key}=${query[key]}`)
			);
			if (url?.search(/\?/) === -1) {
				url += `?${paramsArray.join('&')}`;
			} else {
				url += `&${paramsArray.join('&')}`;
			}
		}
		this.requesting = true;
		return (
			url &&
			fetch(url, {
				mode: 'cors',
				method: 'post',
				body: JSON.stringify(param),
				signal: this.abortController.signal,
			})
				.then((res) => res.json())
				.then((res) => parsing<A>(res))
				.finally(() => {
					this.requesting = false;
				})
		);
	}
}
