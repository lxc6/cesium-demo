import { notification } from 'antd';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface showNotificationProps {
    type: NotificationType;
    message?: string;
    description?: string;
    duration?: number | null;
    [key: string]: any;
}

// notification样式配置
const colorNotification: { [key: string]: [string, string] } = {
    success: ['#4FD878', 'rgba(79, 216, 120, 0.45)'],
    warning: ['#F49500', 'rgba(244, 149, 0, 0.45)'],
    info: ['#C4D4EB', 'rgba(196, 212, 235, 0.45)'],
    error: ['#F34141', 'rgba(243, 65, 65, 0.45)']
};

export const showNotification = (props: showNotificationProps) => {
    const { type = 'info', message = '提示', description = '信息', duration = 3 } = props;
    const [color, backgroundColor] = colorNotification[type];
    const config = {
        maxCount: 1 //	最大显示数，超过限制时，最早的消息会被自动关闭
    };
    notification.config(config);
    notification[type]({
        message,
        description,
        duration,
        style: {
            color: color,
            backgroundColor: backgroundColor
        }
    });
};
