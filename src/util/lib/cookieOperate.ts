export const clearCookie = () => {
    // 获取所有cookie名称
    const cookies = document.cookie.split(';');

    console.log('cookies', cookies);

    // 遍历并删除所有cookie
    for (const cookie in cookies) {
        const cookieName = cookies[cookie].split('=')[0];
        document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
};
