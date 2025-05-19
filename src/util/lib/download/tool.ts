/**
 *  ---------------------------usePrint.ts-------------------------
 *  @Example        使用示例代码
 *  @Description    说明
 *  @Version        0.0.1
 *  @Author         li xusheng
 *  @Date           2023/2/10
 *  @Param
 *  @Return
 *  @File           src/hook usePrint.ts
 *  @Update         [time:user] 某用户更新此文件
 * */
import html2canvas from 'html2canvas';

/**
 * 下载base64格式图片
 * @param base64
 * @param name
 */
export function downloadForBase64(base64: string, name: string) {
    const a = document.createElement('a');
    a.href = base64;
    a.setAttribute('download', name);
    a.click();
}

export interface PrintOptions {
    url?: string;
    selector?: string;
    style?: any;
}

export type PrintType = keyof PrintOptions;

function createImg(src: string) {
    const img = new Image();
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.src = src;
    return img;
}

export function usePrint(resetFn?: () => void) {
    let div: HTMLDivElement | null = null;

    const doPrint = (type: 'image' | 'dom', option: PrintOptions, chartType?: string) => {
        div = document.createElement('div');
        div.className = 'print-area2';
        const { url, selector } = option;
        if (type === 'image' && url) {
            div.appendChild(createImg(url));
            document.body.appendChild(div);
            setTimeout(window.print, 150);
        } else if (selector) {
            html2canvas(document.querySelector(selector) as HTMLElement, {
                onclone: document => {
                    const table = document.querySelector('.el-table') as HTMLDivElement;
                    const charts = document.querySelector('.Chart_one') as HTMLDivElement;
                    table.className = 'el-table-print el-table';
                    if (chartType) {
                        if (chartType === '0') {
                            charts.className = 'columnarChart';
                        } else {
                            charts.className = 'cakeChart';
                        }
                    }
                },
                // scale属性解决图片模糊的问题
                useCORS: true,
                scale: 3,
                allowTaint: true
            }).then(cvs => {
                div!.appendChild(createImg(cvs.toDataURL()));
                document.body.appendChild(div as HTMLElement);
                setTimeout(window.print, 150);
            });
        }
    };

    const reset = () => {
        if (div) {
            document.body.removeChild(div);
            div = null;
        }
        if (resetFn) resetFn();
    };

    window.onafterprint = () => {
        reset();
    };

    return {
        doPrint,
        reset
    };
}
