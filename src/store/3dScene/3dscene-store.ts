import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import { BaseConfig, MainViewInfo, SCENE_STORE_NAMESPACE } from '../type';
import { create3dSceneCase } from './api';

/**
 *  ---------------------------3dscene-store.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    3dscene-store的使用说明
 *  @Version        0.0.1
 *  @Author         xsli1
 *  @Date           2023/4/10
 *  @Param
 *  @Return
 *  @File           libs/data-access/src/lib/store-redux/3dScene
 *  @Update         [time:user] 某用户更新此文件
 * */

export interface Scene3dState {
    loaded: boolean;
    // 用户token
    base: BaseConfig;

    sceneInfos: MainViewInfo;
}

export const sceneSlice = createSlice({
    name: SCENE_STORE_NAMESPACE,
    initialState: {
        loaded: false,
    } as Partial<Scene3dState>,
    reducers: {
        setSceneInfos: (
            state: Scene3dState,
            action: PayloadAction<MainViewInfo>
        ) => ({
            ...state,
            sceneInfos: action.payload,
        }),
    },
    extraReducers: create3dSceneCase,
});

export const { reducer: scene3dReducer, actions: scene3dActions } = sceneSlice;
export const persistSceneReducer = persistReducer(
    {
        key: SCENE_STORE_NAMESPACE,
        keyPrefix: 'tvp:',
        storage,
    },
    scene3dReducer
);
