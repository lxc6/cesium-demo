import axios, {
    AxiosInstance,
    AxiosError,
    AxiosResponse,
    AxiosRequestConfig,
} from 'axios';
import { ResultData } from '@/api/interface';
import { showNotification } from '@/utils/notification';
import { downloadFile } from '@/utils/file';
import {
    getBaseToken,
    removeBaseToken,
    removeBaseUserInfo,
} from '@/utils/auth';
import { persist } from 'zustand/middleware';

console.log('import.meta.env', import.meta.env);

const { VITE_SERVICE_PATH, VITE_GIS_SERVICE_PATH } = import.meta.env;
/**
 * @description: 校验网络请求状态码
 * @param {Number} status
 * @return void
 */

export const checkStatus = (status: number): void => {
    const statusMessages: any = {
        400: '请求失败！请您稍后重试',
        401: '您的会话已过期，请重新登录。',
        403: '当前账号无权限访问！',
        404: '你所访问的资源不存在！',
        405: '请求方式错误！请您稍后重试',
        408: '请求超时！请您稍后重试',
        500: '服务异常！',
        502: '网关错误！',
        503: '服务不可用！',
        504: '网关超时！',
        default: '请求失败！',
    };

    const msg = statusMessages[status] || statusMessages.default;

    showNotification({
        type: 'error',
        message: '异常',
        description: msg,
    });
};
class RequestHttp {
    service: AxiosInstance;

    public constructor(useGIS: boolean = false) {
        // 根据条件选择 baseURL
        const baseURL = useGIS ? VITE_GIS_SERVICE_PATH : VITE_SERVICE_PATH;
        // 实例化axios
        this.service = axios.create({
            // 默认地址请求地址，可在 .env 开头文件中修改
            baseURL,
            // 设置超时时间（10s）
            // timeout: 10000
        });
        let is401NotificationShown = false;

        /**
         * @description 请求拦截器
         */
        this.service.interceptors.request.use(
            (config: any) => {
                const token = getBaseToken() || '';
                return {
                    ...config,
                    headers: {
                        ...config.headers,
                        Authorization: `Bearer ${token}`,
                    },
                };
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        /**
         * @description 响应拦截器
         */
        this.service.interceptors.response.use(
            (response: AxiosResponse) => {
                const allowedContentTypes = [
                    'application/octet-stream',
                    'application/octet-stream;charset=utf-8',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8',
                ];
                if (
                    allowedContentTypes.includes(
                        response.headers['content-type']
                    )
                ) {
                    return response;
                }

                const res = response.data;
                if (res.code === 0 || res.code === '0' || res.code === 200) {
                    return Promise.resolve(res);
                }
                // 登录过期
                if (String(res.code) === '403' || String(res.code) === '402') {
                    // this.logout();
                    // return Promise.resolve(res);
                }
                if (res.code) {
                    showNotification({
                        type: 'error',
                        message: '异常',
                        description: res.msg || res.message,
                    });
                }
                return Promise.reject(res);
            },
            async (error: AxiosError) => {
                const { response } = error;
                // 请求超时单独判断，请求超时没有 response
                if (error.message.indexOf('timeout') !== -1) {
                    showNotification({
                        type: 'error',
                        message: '超时',
                        description: '请求超时，请稍后再试',
                    });
                }
                // 根据响应的错误状态码，做不同的处理
                if (response) console.log('response.status', response.status);

                if (response) {
                    const { status, data } = response as any;
                    // code单独处理提示
                    if (String(status) === '500') {
                        showNotification({
                            type: 'error',
                            message: '异常',
                            description:
                                data?.message || data?.msg || '服务异常！',
                        });
                    } else if (String(status) === '401') {
                        // token失效
                        // 只执行一次
                        !is401NotificationShown ? checkStatus(status) : '';
                        is401NotificationShown = true;
                        this.logout();
                    } else {
                        checkStatus(status);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // * 常用请求方法封装
    get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
        console.log('VITE_SERVICE_PATH', VITE_SERVICE_PATH);

        return this.service.get(url, { params, ..._object });
    }

    post<T>(
        url: string,
        params?: object,
        _object = {}
    ): Promise<ResultData<T>> {
        return this.service.post(url, params, _object);
    }

    put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
        return this.service.put(url, params, _object);
    }

    delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
        return this.service.delete(url, { params, ..._object });
    }

    // * 文件上传请求方法
    upload<T>(
        url: string,
        file: File,
        params?: object
    ): Promise<ResultData<T>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params,
        });
    }

    /**
     * 下载文件（二进制文件流）
     * @param url     请求地址
     * @param params  请求参数
     * @param config  额外的配置信息
     */
    async getFile(url: string, params?: object, config?: AxiosRequestConfig) {
        const res = await this.service.request({
            url,
            params,
            ...config,
            responseType: 'blob',
        });
        if (res) {
            downloadFile(res);
            return true;
        }
        return false;
    }

    /**
     * @description 退出登录操作
     */
    async logout() {
        try {
            // 清空持久化存储和用户信息
            localStorage.clear();
            // 清空用户信息
            removeBaseToken();
            removeBaseUserInfo();
            // 跳转到登录页
            // window.location.href = '/login';
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

// gis 请求实例
export const gisHttp = new RequestHttp(true);

// 默认请求实例
export default new RequestHttp();
