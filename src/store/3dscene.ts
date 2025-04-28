import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BaseConfig } from './type';
import axios from 'axios';

interface Scene3dState {
    loaded: boolean;
    base: BaseConfig;
    [key: string]: any;
}

const useScene3dStore = create(
    persist<Scene3dState>(
        (set) => ({
            loaded: false,
            base: {
                sm3dRvtDataService: '',
                sm3dRvtService: '',
                sm3dRvtWorkSpace: '',
                supermapIserverUrl: '',
                service3dUrl: '',
            },
            getBaseConfig: async () => {
                try {
                    const response = await axios.get('/basic_config_view.json');
                    const data = response.data;
                    set({
                        loaded: true,
                        base: {
                            ...data,
                            sm3dRvtDataService: data.sm3d_rvt_data_service,
                            sm3dRvtService: data.sm3d_rvt_service,
                            sm3dRvtWorkSpace: data.work_space,
                            supermapIserverUrl: data.supermap_iserver_url,
                            service3dUrl: `${data.supermap_iserver_url}/iserver/services/${data.sm3d_rvt_service}/rest/realspace`,
                            // service3dUrl: `http://192.168.1.100:8093/iserver/services/service_rvt_3d_hn_2phase_dev1/rest/realspace/scenes`,
                        },
                    });
                    console.info('获取场景基础配置: 成功');
                    return true;
                } catch (error) {
                    console.error('获取场景基础配置: 失败', error);
                    return false;
                }
            },
        }),
        {
            name: 'jm-base-cesium', // localStorage key
        }
    )
);

export default useScene3dStore;
