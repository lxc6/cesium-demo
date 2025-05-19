export * from './print';
export * from './direction';
export * from './number';
export * from './deepClone';
export * from './layerConversion';
// eslint-disable-next-line no-promise-executor-return
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
