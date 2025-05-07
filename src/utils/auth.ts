// 设置token键值
const BaseTokenKey = 'JM-BASE-TOKEN';
/**
 * 获取token
 */
const getBaseToken = () => {
    return window.localStorage.getItem(BaseTokenKey);
};
/**
 * 设置token
 * @param token
 */
const setBaseToken = (token: string) => {
    return window.localStorage.setItem(BaseTokenKey, token);
};
/**
 * 移除token
 */
const removeBaseToken = () => {
    return window.localStorage.removeItem(BaseTokenKey);
};

// userInfo键值
const BaseUserInfoKey = 'JM-BASE-USERINFO';

const getBaseUserInfo = () => {
    try {
        const data = window.localStorage.getItem(BaseUserInfoKey);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
        return {}; // 返回一个默认
    }
    // return JSON.parse(window.localStorage.getItem(BaseUserInfoKey) || '');
};
const setBaseUserInfo = (info: any) => {
    return window.localStorage.setItem(BaseUserInfoKey, JSON.stringify(info));
};

const removeBaseUserInfo = () => {
    return window.localStorage.removeItem(BaseUserInfoKey);
};
export {
    getBaseToken,
    setBaseToken,
    removeBaseToken,
    getBaseUserInfo,
    setBaseUserInfo,
    removeBaseUserInfo,
};
