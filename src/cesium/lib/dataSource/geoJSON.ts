export class CesiumGeoJSON {
    static resource = (data: object) =>
        new Cesium.Resource({
            url: URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
        });

    dataSource: typeof Cesium.DataSource;

    constructor(private defaultOptions: Record<string, unknown>, private viewer) {
        this.dataSource = new Cesium.GeoJsonDataSource();
        this.viewer.dataSources.add(this.dataSource);
        // 监听数据源变化事件
        this.dataSource.changedEvent.addEventListener(this.changedEvent.bind(this));
        // 监听错误事件
        this.dataSource.errorEvent.addEventListener(this.errorEvent.bind(this));
    }

    // 更新（重新加载）数据源
    async update(newData, options?) {
        if (this.dataSource == null) {
            throw new Error('矢量数据未加载或已被销毁');
        }

        if (typeof newData === 'object') {
            // 使用 Cesium.Resource 对象创建一个新的 GeoJSON 数据源，这么做才能触发changeEvent
            return this.dataSource.load(CesiumGeoJSON.resource(newData), options);
        }
        return this.dataSource.load(newData, options);
    }

    // // 新增（不替换已有的数据）数据源 当前cesium版本没有此方法
    // add(newData, options?) {
    //   if (this.dataSource == null) {
    //     throw new Error('矢量数据未加载或已被销毁');
    //   }
    //
    //   // 使用 Cesium.Resource 对象创建一个新的 GeoJSON 数据源，这么做才能触发changeEvent
    //   const resource = new Cesium.Resource({
    //     url: URL.createObjectURL(new Blob([JSON.stringify(newData)], { type: 'application/json' }))
    //   });
    //
    //   // 重新加载数据源
    //   return this.dataSource.process(resource, options);
    // }

    // 数据源变化的事件
    changedEvent(dataSource) {
        console.log('矢量数据源已被修改:', dataSource);
    }

    // 数据错误的事件
    errorEvent(err) {
        console.error('矢量数据加载发生了一些错误：', err);
    }

    // 销毁数据源和监听器
    destroy() {
        if (this.dataSource == null) {
            throw new Error('矢量数据未加载或已被销毁');
        }

        // 取消所有监听器
        this.dataSource.changedEvent.removeEventListener(this.changedEvent.bind(this));
        this.dataSource.errorEvent.removeEventListener(this.errorEvent.bind(this));

        // 移除数据源
        this.viewer.dataSources.remove(this.dataSource);
        this.dataSource = null;
        console.log('CesiumGeoJSON has been destroyed.');
    }
}
