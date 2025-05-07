declare interface NR {
    code: number;
    msg: string;
}

declare interface NormalResponse<T> extends NR {
    data: T;
}

declare interface RequestConfig<P = null, D = NormalResponse<unknown>> {
    // 请求参数
    params: P;
    // 响应体
    responder: D;
}

// 登陆时相应体
declare interface SignRes {
    code: number;
    msg: string;
    token: string;
}

declare interface JSONResult<T> extends NR {
    result: T;
    url: string;
    date: string;
    code: number;
}
