import type HlsType from 'hls.js';
import HlsMin from 'hls.js';

export class HlsInit {
    hls: HlsType;

    constructor(el: HTMLVideoElement, videoUrl: string) {
        this.hls = new HlsMin();
        this.initialize(el, videoUrl);
    }

    initialize(el: HTMLVideoElement, videoUrl: string) {
        if (HlsMin.isSupported()) {
            // 一旦MediaSource准备好，hls对象就会触发MEDIA_ATTACHED事件
            this.hls.on(HlsMin.Events.MEDIA_ATTACHED, function () {
                console.log('Video和hls.js已完成绑定');
            });
            this.hls.loadSource(videoUrl);
            // 把它们结合在一起
            this.hls.attachMedia(el);

            this.hls.on(HlsMin.Events.ERROR, (event, data) => {
                console.log(event);
                if (data.fatal) {
                    switch (data.type) {
                        case HlsMin.ErrorTypes.NETWORK_ERROR:
                            // 尝试恢复网络错误
                            console.log('遇到网络错误，正在尝试恢复');
                            this.hls.startLoad();
                            break;
                        case HlsMin.ErrorTypes.MEDIA_ERROR:
                            console.log('遇到媒体错误，正在尝试恢复');
                            this.hls.recoverMediaError();
                            break;
                        default:
                            // cannot recover
                            this.destroy();
                            break;
                    }
                }
            });
        }
    }

    destroy() {
        this.hls.destroy();
    }
}
