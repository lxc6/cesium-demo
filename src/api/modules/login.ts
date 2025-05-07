import http from '@/api';
import { ReqLoginForm } from '../interface';

/**
 * @name 登录模块
 */

/**
 * 用户登录新
 * */
export const loginApiNew = (params: ReqLoginForm) => {
    return http.post<string>('/iam/api/user/get-login', params);
};

/**
/**
 * 用户登出
 * */
export const logoutApi = () => {
    return http.get<any>('/iam/api/user/log-out');
};

/**
/**
 * 验证码
 * */
export const captchaApi = () => {
    return http.get<any>('/iam/api/captcha/captchaImage');
};
/**
 * 用户=快捷登录
 * */
export const loginApi = (params: ReqLoginForm) => {
    return http.post<string>('/iam/api/user/rapid-login', params);
};
