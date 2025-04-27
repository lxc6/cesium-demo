import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { SCENE_STORE_NAMESPACE } from '../type';
import {
    axiosHttpClient,
    Scene3dState,
    Twins3D,
    Twins3DModel,
} from '@tvp/data-access';
import { Print } from '@tvp/util';

export const getBaseConfig = createAsyncThunk(
    `${SCENE_STORE_NAMESPACE}/getBaseConfig`,
    (arg, thunkAPI) => {
        return axiosHttpClient.get<{ data: Twins3DModel[Twins3D.CONFIG] }>(
            Twins3D.CONFIG
        );
    }
);

export function create3dSceneCase(
    builder: ActionReducerMapBuilder<Scene3dState>
) {
    builder.addCase(getBaseConfig.fulfilled, (state, action) => {
        Print.Info(
            `获取场景基础配置: ${action.payload.data ? '成功' : '失败'}`
        );
        if (action.payload && action.payload.data) {
            const data = action.payload.data;
            state.loaded = true;
            state.base = {
                ...data,
                service3dUrl: `${data.supermapIserverUrl}/iserver/services/${data.sm3dRvtService}/rest/realspace`,
            };
        }
    });
}
