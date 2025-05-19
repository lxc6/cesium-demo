export interface ParticleSystemOptions {
    image: string;
    startColor?: typeof Cesium.Color;
    endColor?: typeof Cesium.Color;
    startScale?: number;
    endScale?: number;
    minimumParticleLife?: number;
    maximumParticleLife?: number;
    minimumSpeed?: number;
    maximumSpeed?: number;
    imageSize?: typeof Cesium.Cartesian2;
    emissionRate?: number;
    gravity?: number;

    particleSize?: number;
    lifetime?: number;
    // 循环是否开启
    loop?: boolean;
    emitter?: typeof Cesium.Emitter;
    sizeInMeters?: boolean;
    updateCallback?: (...args: any[]) => void;
    performance?: boolean;
}

export class BaseParticle {
    static getDefaultOption(): ParticleSystemOptions {
        return {
            image: '/assets/texture/fire.png',
            startColor: new Cesium.Color(1, 1, 1, 1),
            endColor: new Cesium.Color(0.5, 0, 0, 0),
            startScale: 3,
            endScale: 1.5,
            minimumParticleLife: 1.5,
            maximumParticleLife: 1.8,
            minimumSpeed: 5,
            maximumSpeed: 8,
            imageSize: new Cesium.Cartesian2(2, 2),
            emissionRate: 50,
            lifetime: 6.0,
            // 循环是否开启
            loop: true,
            emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)),
            sizeInMeters: true
        };
    }

    static getWaterOption(): ParticleSystemOptions {
        return {
            image: '/assets/texture/water.png',
            startColor: new Cesium.Color(1, 1, 1, 0.6),
            endColor: new Cesium.Color(0.8, 0.86, 1, 0.4),
            // 数量
            emissionRate: 20,
            // 初始比例
            startScale: 1,
            // 终止比例
            endScale: 10,
            // 最小生命周期
            minimumParticleLife: 6,
            // 最大生命周期
            maximumParticleLife: 7,
            // 最小速度
            minimumSpeed: 5,
            // 最大速度
            maximumSpeed: 9.5,
            // 粒子大小
            imageSize: new Cesium.Cartesian2(1, 1),
            lifetime: 16,
            // 重力
            updateCallback: this.applyGravity,
            // 循环是否开启
            loop: true,
            //粒子发射器
            emitter: new Cesium.CircleEmitter(2.0),
            sizeInMeters: true
        };
    }

    entity4;

    activeParticle?: typeof Cesium.ParticleSystem;

    /**
     *
     * @param viewer
     * @param position 可以传递根据数据动态变化的callback
     * @param options
     */
    constructor(
        private viewer: typeof Cesium.Viewer,
        private position: typeof Cesium.Cartesian3 | typeof Cesium.CallbackProperty,
        private options: ParticleSystemOptions
    ) {
        // 粒子系统的起点，发射源
        this.entity4 = viewer.entities.add({
            position,
            label: { text: '' }
        });
    }

    // 粒子散播的形态，起始状态，翻转角度等等
    private computeEmitterModelMatrix() {
        const hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0, 0);
        const trs = new Cesium.TranslationRotationScale();
        trs.translation = Cesium.Cartesian3.fromElements(0, 0, 2);
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr);
        return Cesium.Matrix4.fromTranslationRotationScale(trs);
    }

    private computeEmitterModelMatrixWater() {
        let hpr = new Cesium.HeadingPitchRoll();
        const trs = new Cesium.TranslationRotationScale();
        const translation = new Cesium.Cartesian3();
        const rotation = new Cesium.Quaternion();
        const emitterModelMatrix = new Cesium.Matrix4();
        //调节粒子的发射方向
        hpr = Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, hpr);
        //喷泉位置
        trs.translation = Cesium.Cartesian3.fromElements(0, 0, 5.4, translation);
        trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

        return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
    }

    static applyGravity(p, dt) {
        const gravityScratch = new Cesium.Cartesian3();
        // We need to compute a local up vector for each particle in geocentric space.
        const position = p.position;

        Cesium.Cartesian3.normalize(position, gravityScratch);
        Cesium.Cartesian3.multiplyByScalar(gravityScratch, -3.5 * dt, gravityScratch);

        p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
    }

    createParticle() {
        this.viewer.clock.multiplier = 1;
        this.activeParticle = this.viewer.scene.primitives.add(
            new Cesium.ParticleSystem({
                ...this.options,
                // 将粒子系统从模型坐标转换为世界坐标的 4x4 转换矩阵。
                modelMatrix: this.entity4.computeModelMatrix(this.viewer.clock.startTime),
                // 在粒子系统局部坐标系内变换粒子系统发射器的 4x4 变换矩阵。
                emitterModelMatrix: this.computeEmitterModelMatrix()
            })
        );
        return this.activeParticle;
    }

    createWaterParticle() {
        this.viewer.clock.multiplier = 1;
        this.activeParticle = this.viewer.scene.primitives.add(
            new Cesium.ParticleSystem({
                ...this.options,
                // 将粒子系统从模型坐标转换为世界坐标的 4x4 转换矩阵。
                modelMatrix: this.entity4.computeModelMatrix(this.viewer.clock.startTime),
                // 在粒子系统局部坐标系内变换粒子系统发射器的 4x4 变换矩阵。
                emitterModelMatrix: this.computeEmitterModelMatrixWater()
            })
        );
        return this.activeParticle;
    }

    removeParticle() {
        this.viewer.entities.remove(this.entity4);
        this.viewer.scene.primitives.remove(this.activeParticle);
        this.activeParticle = undefined;
    }
}
