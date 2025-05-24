import { FeatureAttribute, FeatureAttrType } from '@tvp/data-access';
import { Processed, RawFeature, Response } from '@tvp/utility/cesium';

export function parsing<A extends FeatureAttrType, T = FeatureAttribute<A>>(
    response: Response<RawFeature>
): Response<Processed<T>> {
    // 解析
    const { features } = response;
    const next: Response<Processed<T>> = { ...response, features: [] };

    features.forEach(feature => {
        const processed = {
            ID: feature.ID,
            geometry: feature.geometry,
            stringID: feature.stringID,
            attribute: feature.fieldNames.reduce((obj, key, index) => {
                obj[key] = feature.fieldValues[index];
                return obj;
            }, {}) as T
        };
        next.features.push(processed);
    });

    return next;
}
