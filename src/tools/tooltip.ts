export interface MouseTooltip {
    div?: HTMLElement;
    message: string;
    setVisible(visible: boolean): MouseTooltip;
    showAt(position: { x: number; y: number }, message: string): MouseTooltip;
    updatePosition(position: { x: number; y: number }): MouseTooltip;
    destroy(): void;
}

export function createTooltip(host: HTMLDivElement): MouseTooltip {
    return new (class {
        div?: HTMLElement;

        messageContainer = document.createElement('div');

        message = '';

        constructor() {
            const hasDiv = document.querySelector('.twipsy.right');
            if (!hasDiv) {
                this.messageContainer.className = 'twipsy-inner';
                this.messageContainer.style.color =
                    'var(--color-text-reverse2)';
                this.div = document.createElement('div');
                this.div.style.position = 'absolute';
                this.div.className = 'twipsy right';
                this.div.insertAdjacentHTML(
                    'afterbegin',
                    '<div class="twipsy-arrow"></div>'
                );
                this.div.appendChild(this.messageContainer);
            } else {
                this.div = hasDiv as HTMLElement;
            }
            host.appendChild(this.div);
            // 通过class设置不响应事件可以解决鼠标移动过快时阻止上层移动导致的闪烁问题， 以下代码无用
            // this.div.onmousemove = evt => this.showAt({ x: evt.clientX, y: evt.clientY }, this.message);
        }

        setVisible(visible: boolean) {
            this.div!.style.display = visible ? 'block' : 'none';
            return this;
        }

        // 提示框
        showAt(position: { x: number; y: number }, message: string) {
            if (position && message) {
                this.setVisible(true);
                this.messageContainer.innerHTML = message;
                this.div!.style.left = `${position.x + 15}px`;
                this.div!.style.top = `${
                    position.y - this.div!.clientHeight / 2
                }px`;
                this.message = message;
            }
            return this;
        }

        updatePosition(position: { x: number; y: number }) {
            this.div!.style.left = `${position.x + 15}px`;
            this.div!.style.top = `${
                position.y - this.div!.clientHeight / 2
            }px`;
            return this;
        }

        destroy() {
            this.div?.remove();
            this.messageContainer?.remove();
        }
    })();
}
