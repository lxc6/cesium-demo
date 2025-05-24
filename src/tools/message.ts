import { notification, NotificationArgsProps } from 'antd';
import './message.css';

export interface DrawMessageConfig
    extends Omit<NotificationArgsProps, 'message' | 'description'> {
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    className?: string;
    closeIcon?: boolean;
    getContainer?: any; // 容器
}

export interface DrawMessage {
    show(content: string, key?: string): void;
    hide(key?: string): void;
    destroy(): void;
}

export function createDrawMessage(
    config: Partial<DrawMessageConfig> = {}
): DrawMessage {
    const messageKeys: Map<string, any> = new Map();
    const escKeyListeners: Map<string, (event: KeyboardEvent) => void> =
        new Map();

    const handleEscKeyPress = (key: string) => (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            hide(key);
        }
    };

    const show = (content: string, key: string = 'default') => {
        // 先清除已存在的消息
        hide(key);

        // 创建新消息
        const defaultConfig: DrawMessageConfig = {
            type: 'info',
            duration: 0,
            placement: 'bottomLeft',
            className: 'draw-notification',
            closeIcon: false,
            getContainer:
                document.querySelector('.cesium-viewer') || document.body,
        };

        const finalConfig = { ...defaultConfig, ...config };
        notification.config({
            getContainer: () => finalConfig.getContainer,
        });
        const messageKey = notification.open({
            type: finalConfig.type,
            message: content,
            description: '',
            duration: finalConfig.duration,
            className: finalConfig.className,
            key: `draw-message-${key}`,
            placement: finalConfig.placement,
            closeIcon: finalConfig.closeIcon,
            style: {
                width: 'max-content',
            },
            onClose: () => {
                messageKeys.delete(key);
                const listener = escKeyListeners.get(key);
                if (listener) {
                    window.removeEventListener('keydown', listener);
                    escKeyListeners.delete(key);
                }
            },
        });

        messageKeys.set(key, messageKey);

        // 添加ESC键监听
        const escKeyListener = handleEscKeyPress(key);
        escKeyListeners.set(key, escKeyListener);
        window.addEventListener('keydown', escKeyListener);
    };

    const hide = (key: string = 'default') => {
        if (messageKeys.has(key)) {
            notification.destroy(`draw-message-${key}`);
            messageKeys.delete(key);

            const listener = escKeyListeners.get(key);
            if (listener) {
                window.removeEventListener('keydown', listener);
                escKeyListeners.delete(key);
            }
        }
    };

    const destroy = () => {
        messageKeys.forEach((_, key) => {
            notification.destroy(`draw-message-${key}`);
        });
        escKeyListeners.forEach((listener) => {
            window.removeEventListener('keydown', listener);
        });
        messageKeys.clear();
        escKeyListeners.clear();
    };

    return {
        show,
        hide,
        destroy,
    };
}
