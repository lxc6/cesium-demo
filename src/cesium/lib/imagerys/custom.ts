import { gisSelector, scene3dSelector } from '@/data-access';

export function localMap() {
    const { map2dConfig } = gisSelector();
    const { base } = scene3dSelector();
    if (!map2dConfig || !base) {
        return;
    }

    return new Cesium.SuperMapImageryProvider({
        url: `${base.supermapIserverUrl}/iserver/services/${
            map2dConfig.basemap_service
        }/rest/maps/${map2dConfig.basemap_service.split('-').pop()}`, // 影像服务的地址
    });
    // return new Cesium.SuperMapImageryProvider({
    //     url: `${base.supermapIserverUrl}/iserver/services/3D-3D-map-hn-test-3/rest/realspace/datas/MosaicResult` // 影像服务的地址
    // });

    // 目前写死
    // return new Cesium.SuperMapImageryProvider({
    //     url: `//192.168.1.100:8091/iserver/services/map-ugcv5-aqgistest1basemapscene/rest/maps/aqgistest1basemapscene` // 影像服务的地址
    // });
}

export function localThreeMap() {
    const { map2dConfig } = gisSelector();
    const { base } = scene3dSelector();
    if (!map2dConfig || !base) {
        return;
    }

    return new Cesium.CesiumTerrainProvider({
        url: `${base.supermapIserverUrl}/iserver/services/3D-3D-map-hn-test-3/rest/realspace/datas/DatasetDEM`,
        isSct: true, //地形服务源自SuperMap iServer发布时需设置isSct为true
        invisibility: true,
        requestVertexNormals: true,
    });
}

export function twoDMap() {
    return new Cesium.SuperMapImageryProvider({
        // url: `//${map2dConfig.supermap_iserver_url}/iserver/services/${
        //     map2dConfig.basemap_service
        // }/rest/maps/${map2dConfig.basemap_service.split('-').pop()}` // 影像服务的地址
        // url: 'http://36.138.170.195:18091/iserver/services/map-ugcv5-basemapscene/rest/maps/basemapscene'
        // url: `//36.138.170.195:18091/iserver/services/map-ugcv5-ylgistest2basemapscene3857/rest/maps/ylgistest2basemapscene_3857`
        url: `//36.138.170.195:18091/iserver/services/map_yl_gis_test2/rest/maps/terrain_scene`,
        prjCoordSys: {
            epsgCode: 3857,
        },
    });
}

export function noteMap() {
    return new Cesium.SuperMapImageryProvider({
        // url: `//${map2dConfig.supermap_iserver_url}/iserver/services/${
        //     map2dConfig.basemap_service
        // }/rest/maps/${map2dConfig.basemap_service.split('-').pop()}` // 影像服务的地址
        // url: 'http://36.138.170.195:18091/iserver/services/map-ugcv5-basemapscene/rest/maps/basemapscene'
        // url: `//36.138.170.195:18091/iserver/services/map-ugcv5-ylgistest2basemapscene3857/rest/maps/ylgistest2basemapscene_3857`
        url: `//36.138.170.195:18091/iserver/services/map_yl_gis_test2/rest/maps/note_scene`,
        prjCoordSys: {
            epsgCode: 3857,
        },
    });
}

export function arcgisMap() {
    return new Cesium.ArcGisMapServerImageryProvider({
        url: '//server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer',
    });
}

export function tiandituMap() {
    return new Cesium.TiandituImageryProvider({
        url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=5d27dc75ca0c3bdf34f657ffe1e9881d',
    });
}
// /iserver/services/map-ugcv5-ylbasemapscene/rest/maps/ylbasemapscene
// map-ugcv5-ylgistest2basemapscene
