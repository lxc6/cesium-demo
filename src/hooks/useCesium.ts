import { useEffect, useRef, useState, useCallback } from 'react';
import { CoreScene } from '../core/CoreScene';
import { SceneOptions } from '../types';
import { EventCallback } from '../types/events';
import { CameraPosition, FlyToOptions } from '../types/camera';
import { EntityOptions } from '../types/entity';
import { useCesiumStore } from '@/store/cesium';
import axios from 'axios';
import axiosHttp from '@/api';

const baseUrl = import.meta.env.VITE_PROXY_DOMAIN_REAL;
/** Cesium Hook 返回类型 */
interface UseCesiumReturn {
    coreCesium: CoreScene | null;
    isReady: boolean;
    camera: {
        flyTo: (options: FlyToOptions) => Promise<void>;
        getCurrentPosition: () => CameraPosition;
    };
    entity: {
        add: (options: EntityOptions) => void;
        remove: (id: string) => void;
        update: (id: string, options: Partial<EntityOptions>) => void;
    };
    weather: {
        setType: (type: 'none' | 'rain' | 'snow', intensity?: number) => void;
        setFog: (enabled: boolean, density?: number) => void;
        setBloom: (enabled: boolean, intensity?: number) => void;
    };
    performance: {
        enableMonitoring: (callback: (stats: any) => void) => void;
        setQuality: (quality: number) => void;
    };
    viewer?: Cesium.Viewer;
}

/**
 * Cesium 场景管理 Hook
 * 提供场景管理、相机控制、实体管理、天气效果等功能的统一接口
 */
export const useCesium = (
    containerId: string,
    options?: SceneOptions
): UseCesiumReturn => {
    const [localIsReady, setLocalIsReady] = useState(false);
    const sceneRef = useRef<CoreScene | null>(null);

    // 相机控制
    const camera = {
        flyTo: useCallback((options: FlyToOptions) => {
            return (
                sceneRef.current?.cameraManager.flyTo(options) ||
                Promise.resolve()
            );
        }, []),
        getCurrentPosition: useCallback(() => {
            return (
                sceneRef.current?.cameraManager.getCurrentPosition() || {
                    longitude: 190.529,
                    latitude: 38.111,
                    height: 1000,
                }
            );
        }, []),
    };

    // 实体管理
    const entity = {
        add: useCallback((options: EntityOptions) => {
            sceneRef.current?.entityManager.add(options);
        }, []),
        remove: useCallback((id: string) => {
            sceneRef.current?.entityManager.remove(id);
        }, []),
        update: useCallback((id: string, options: Partial<EntityOptions>) => {
            const entity = sceneRef.current?.entityManager.getById(id);
            if (entity) {
                // 更新实体属性
                Object.assign(entity, options);
            }
        }, []),
    };

    // 天气效果
    const weather = {
        setType: useCallback(
            (type: 'none' | 'rain' | 'snow', intensity?: number) => {
                sceneRef.current?.setWeatherEffect(type, intensity);
            },
            []
        ),
        setFog: useCallback((enabled: boolean, density?: number) => {
            sceneRef.current?.setEnvironmentEffects({
                fog: enabled,
                fogDensity: density,
            });
        }, []),
        setBloom: useCallback((enabled: boolean, intensity?: number) => {
            sceneRef.current?.setEnvironmentEffects({
                bloom: enabled,
                bloomIntensity: intensity,
            });
        }, []),
    };

    // 性能管理
    const performance = {
        enableMonitoring: useCallback((callback: (stats: any) => void) => {
            sceneRef.current?.enablePerformanceMonitoring(callback);
        }, []),
        setQuality: useCallback((quality: number) => {
            sceneRef.current?.setQuality(quality);
        }, []),
    };

    //  初始化场景
    const initScene = async () => {
        const { baseConfig } = useCesiumStore.getState();
        try {
            if (!sceneRef.current && baseConfig) {
                const coreCesium = new CoreScene(containerId, options);
                sceneRef.current = coreCesium;
                // 等待场景初始化完成
                await new Promise<void>((resolve) => {
                    const checkReady = () => {
                        if (coreCesium.viewer && !coreCesium.isSceneDestroyed) {
                            resolve();
                        } else {
                            requestAnimationFrame(checkReady);
                        }
                    };
                    checkReady();
                });

                // 添加默认底图
                if (options?.defaultImageryProvider) {
                    try {
                        coreCesium.layerManager.addImageryProvider(
                            'defaultLayer',
                            options.defaultImageryProvider
                        );
                    } catch (error) {
                        console.error('初始化默认底图失败:', error);
                    }
                }
                setLocalIsReady(true);
            }
        } catch (error) {
            console.error('初始化场景失败:', error);
        }
    };

    const getScene = async (modelId: any) => {
        const { data } = await axiosHttp.get(
            `http://3d.dev.tech/gateway/twins3d/model/showArea/findModelInfo`,
            {
                modelId,
            }
        );
        console.log('data: ', data);

        if (!data) {
            return;
        }
        return data;
    };

    // 添加默认模型
    const addPipe = async () => {
        const { baseConfig } = useCesiumStore.getState();
        // ------添加默认模型------
        const service3dUrl: any = baseConfig.service3dUrl;
        // pipeline_scene  device_scene
        console.log('sceneRef.current?', sceneRef.current?.viewer.scene);
        console.log('service3dUrl url:', service3dUrl);
        // device_scene
        if (sceneRef.current && sceneRef.current.viewer && baseConfig.modelId) {
            console.log('baseConfig.modelId', baseConfig.modelId);
            const viewer = sceneRef.current.viewer;
            const { scene } = viewer;
            try {
                const datas = await getScene(baseConfig.modelId);
                console.log('datas----------: ', datas);
                // await sceneRef.current.viewer.scene.open(
                //     service3dUrl,
                //     'device_scene',
                //     {
                //         autoSetView: false,
                //     }
                // );
                console.log('scene', scene);

                await Promise.all([
                    scene
                        .open(service3dUrl, 'pipeline_scene', {
                            autoSetView: false,
                        })
                        .then((layers) => {
                            console.log(
                                '==========================layers1: ',
                                layers
                            );
                            // layers.forEach((layer) => {

                            // });
                            return layers;
                        }),
                    scene
                        .open(service3dUrl, 'device_scene', {
                            autoSetView: false,
                        })
                        .then((layers) => {
                            console.log(
                                '==========================layers2: ',
                                layers
                            );
                            // layers.forEach((layer) => {

                            // });
                            return layers;
                        }),
                    ,
                ]);
            } catch (error) {
                console.log('error: ', error);
            }
        }
    };

    useEffect(() => {
        initScene();
        addPipe();

        return () => {
            console.log('-----------销毁');

            // if (sceneRef.current) {
            //     sceneRef.current.destroy();
            //     sceneRef.current = null;
            //     setLocalIsReady(false);
            // }
        };
    }, []);

    return {
        coreCesium: sceneRef.current,
        viewer: sceneRef.current?.viewer,
        isReady: localIsReady,
        camera,
        entity,
        weather,
        performance,
    };
};
