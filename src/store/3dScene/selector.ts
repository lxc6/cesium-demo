import { AppStore, PIPE_IDENTIFIER, SCENE_STORE_NAMESPACE } from '@tvp/data-access';

export function use3DSelectors(store: AppStore) {
    const state = store.getState()[SCENE_STORE_NAMESPACE];

    return {
        ...state,
        // 获取所有图层管线的数据集名字
        getPipeLayers() {
            return (
                state.sceneInfos?.sceneList
                    .filter(source => {
                        return source.sceneMark.indexOf(PIPE_IDENTIFIER) !== -1;
                    })
                    .map(source => source.layers)
                    .reduce((acc, val) => acc.concat(val), []) || []
            );
        }
    };
}
