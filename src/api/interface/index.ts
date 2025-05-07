// * 请求响应参数(不包含data)
export interface Result {
    code: number;
    message: string;
    timestamp?: number;
}

// * 请求响应参数(包含data)
export interface ResultData<T = any> extends Result {
    totalPage?: any;
    totalRow?: string | number;
    records?: any;
    data: T;
    [key: string]: any;
}

// * 登录
export interface ReqLoginForm {
    username: string;
    password: string;
    type?: string;
    ticket?: string;
    captcha?: string;
    [key: string]: any;
}
export interface ResLogin {
    token: string;
    ticket?: string;
    userName?: string;
    userId?: string;
    [key: string]: any;
}
