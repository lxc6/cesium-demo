/** 预设位置坐标 */
export const PRESET_LOCATIONS = {
    HAINAN: {
        name: '海南',
        position: {
            longitude: 109.184,
            latitude: 19.759,
            height: 280,
        },
        camera: {
            heading: 0,
            pitch: -45,
            roll: 0,
        },
    },
    YULIN: {
        name: '榆林',
        position: {
            longitude: 109.53,
            latitude: 38.111,
            height: 800,
        },
        camera: {
            heading: 0,
            pitch: -45,
            roll: 0,
        },
    },
    ANQING: {
        name: '安庆',
        position: {
            longitude: 117.028,
            latitude: 30.532,
            height: 500,
        },
        camera: {
            heading: 0,
            pitch: -45,
            roll: 0,
        },
    },
    // BEIJING: {
    //     name: '北京',
    //     position: {
    //         longitude: 116.3,
    //         latitude: 39.9,
    //         height: 800,
    //     },
    //     camera: {
    //         heading: 0,
    //         pitch: -45,
    //         roll: 0,
    //     },
    // },
    // XIAN: {
    //     name: '西安',
    //     position: {
    //         longitude: 108.94,
    //         latitude: 34.34,
    //         height: 600,
    //     },
    //     camera: {
    //         heading: 0,
    //         pitch: -45,
    //         roll: 0,
    //     },
    // },
} as const;
