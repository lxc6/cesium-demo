// 加载模型by primitive
import { ThreeDimensionalContextService } from '@/cesium';

export function useAddModelByPrimitive(
    url: string,
    position: number[],
    options?: { name: string }
) {
    const { viewer } = ThreeDimensionalContextService.Instance;
    const origin = Cesium.Cartesian3.fromDegrees(...position);
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin); // 加载坐标
    const modelPrimitive = Cesium.Model.fromGltf({
        url,
        modelMatrix,
        show: true, // default
        // minimumPixelSize : 128,  // never smaller than 128 pixels
        maximumScale: 20000, // never larger than 20000 * model size (overrides minimumPixelSize)
        allowPicking: true,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scene: viewer.scene,
    });
    modelPrimitive.name = options?.name || Date.now();
    modelPrimitive.type = 'model';
    modelPrimitive.readyPromise.then((model) => {
        // 模型加载完毕后加载模型的动画
        model.activeAnimations.addAll({
            speedup: 1,
            loop: Cesium.ModelAnimationLoop.REPEAT,
        });
    });
    return modelPrimitive;
}
