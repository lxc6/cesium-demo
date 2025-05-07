import React, { FC, useEffect, useState, useRef } from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { showNotification } from '@/utils/notification';
import { useDispatch } from 'react-redux';
import { pxToRem } from '@/utils/setBaseFontSize';
import pre_account from '@/assets/images/pre_account.png';
import pre_password from '@/assets/images/pre_password.png';
import pre_captcha from '@/assets/images/pre_captcha.png';

// 导入api
import { loginApiNew, captchaApi } from '@/api/modules/login';
import { setBaseToken, removeBaseToken } from '@/utils/auth';
import useAnimation from './bgAnimation';
import './login.scss';

const Login: FC = () => {
    const subTitle = 'cesium-demo';
    const navigate = useNavigate();
    const location = useLocation();
    const from = location?.pathname || '/home';
    /** 登录表单参数与方法 */
    // 获取antd的form实例
    const [form] = Form.useForm();
    // 按钮loading
    const [loading, setLoading] = useState(false);
    // // 验证码uuid
    const [uuid, setUuid] = useState();
    // 验证码svg标签
    const [verifyImg, setVerifyImg] = useState<any>();

    const [publicConfig, setPublicConfig] = useState<any>();

    const cavansRef = useRef<any>(null);

    // 获取验证码
    const getCode = async () => {
        try {
            const { data } = await captchaApi();
            setUuid(data.uuid);
            setVerifyImg(`<img
                src="data:image/png;base64,${data.img}"
                alt="验证码"
                style="width:${pxToRem(88)};height${pxToRem(
                30
            )};border-radius:${pxToRem(5)}"
            />`);
        } catch (error) {
            setVerifyImg(`<img
                src=""
                alt="验证码"
                style="width:${pxToRem(88)};height:${pxToRem(
                30
            )};border-radius:${pxToRem(5)}"
            />`);
        }
    };

    const onFinish = async (values: any) => {
        let loginInfo = {
            username: values.username,
            password: values.password,
            captcha: values.captcha,
            uuid: uuid,
            type: 'PC',
        };
        // 开始loading
        setLoading(true);

        if (values.remember) {
            // 记住密码存储用户信息
            localStorage.setItem('username', values.username);
            // localStorage.setItem('password', encrypt(values.password))
            localStorage.setItem('password', values.password);
            localStorage.setItem('remember', values.remember);
        } else {
            // 移除用户信息
            localStorage.removeItem('username');
            localStorage.removeItem('password');
            localStorage.removeItem('remember');
        }

        try {
            const { data } = await loginApiNew(loginInfo);
            if (data) {
                setBaseToken(data);
            }

            // 若上次为登录页，跳转到user
            if (from === '/login') {
                navigate('/demo', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
            showNotification({
                type: 'success',
                message: '成功',
                description: '登录成功！',
            });
        } catch (e) {
            removeBaseToken();
            // dispatch(setToken(''));
            // dispatch(setUserInfo(''));
            // persistor.purge(); // 清空持久化存储
            console.error(e);
        }
        setLoading(false);
    };

    // 获取缓存中的用户名密码信息
    const getUser = () => {
        const username = localStorage.getItem('username') ?? '';
        const password = localStorage.getItem('password') ?? '';
        const remember = localStorage.getItem('remember') ?? false;
        // 通过antd表单实例对象的setFieldsValue方法回显值
        form.setFieldsValue({
            username,
            // password: decrypt(password),
            password,
            remember: Boolean(remember),
        });
    };

    useEffect(() => {
        getCode();
        getUser();
    }, []);

    useEffect(() => {
        let animation: any = null;
        if (cavansRef.current) {
            animation = useAnimation(cavansRef.current);
            if (animation) {
                animation.init();
                animation.animation();
            }
        }
        return () => {
            animation?.stop();
            animation = null;
        };
    }, [cavansRef]);

    return (
        <div className='base-login'>
            <canvas id='login-canvas' ref={cavansRef}></canvas>
            <div className='login-content'>
                <div className='login-text'>
                    <div className='login-title'>
                        <div className='login_logo'></div>
                        <h2>{subTitle}</h2>
                    </div>
                </div>

                <div className='login-form'>
                    <h1>用户登录</h1>
                    <div className='login-form-inner'>
                        <Form
                            name='basic'
                            form={form}
                            initialValues={{ remember: false }}
                            onFinish={onFinish}
                            autoComplete='off'
                        >
                            <Form.Item
                                // label="用户名"
                                name='username'
                                rules={[
                                    {
                                        required: true,
                                        max: 12,
                                        message: '请输入用户名!',
                                    },
                                ]}
                                initialValue='admin'
                            >
                                <Input
                                    className='account-input'
                                    placeholder='请输入您的账号'
                                    prefix={
                                        <img
                                            src={pre_account}
                                            alt='账号'
                                            className='prefix-img'
                                        />
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                // label="密码"
                                name='password'
                                rules={[
                                    { required: true, message: '请输入密码!' },
                                ]}
                                initialValue='admin'
                            >
                                <Input.Password
                                    placeholder='请输入您的密码'
                                    prefix={
                                        <img
                                            src={pre_password}
                                            alt='账号'
                                            className='prefix-img'
                                        />
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                name='captcha'
                                rules={[
                                    {
                                        required: true,
                                        min: 4,
                                        max: 4,
                                        message: '请输入正确格式验证码!',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder='请输入验证码'
                                    prefix={
                                        <img
                                            src={pre_captcha}
                                            alt='账号'
                                            className='prefix-img'
                                        />
                                    }
                                    suffix={
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: verifyImg as any,
                                            }}
                                            className='login-captcha'
                                            onClick={() => getCode()}
                                        ></div>
                                    }
                                />
                            </Form.Item>
                            <Form.Item className='login-btn'>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    disabled={loading}
                                    loading={loading}
                                >
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>

            {/* <div className="login-container">
                <div className="login-form">
                    <Form
                        name="basic"
                        form={form}
                        initialValues={{ remember: false }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            // label="用户名"
                            name="username"
                            rules={[{ required: true, max: 12, message: '请输入用户名!' }]}
                            initialValue="admin"
                        >
                            <Input
                                className="account-input"
                                placeholder="请输入您的账号"
                                prefix={<img src={pre_account} alt="账号" className="prefix-img" />}
                            />
                        </Form.Item>

                        <Form.Item
                            // label="密码"
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                            initialValue="admin"
                        >
                            <Input.Password
                                placeholder="请输入您的密码"
                                prefix={
                                    <img src={pre_password} alt="账号" className="prefix-img" />
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="captcha"
                            rules={[
                                { required: true, min: 4, max: 4, message: '请输入正确格式验证码!' }
                            ]}
                        >
                            <Input
                                placeholder="请输入验证码"
                                prefix={<img src={pre_captcha} alt="账号" className="prefix-img" />}
                                suffix={
                                    <div
                                        dangerouslySetInnerHTML={{ __html: verifyImg as any }}
                                        className="login-captcha"
                                        onClick={() => getCode()}
                                    ></div>
                                }
                            />
                        </Form.Item>
                        <Form.Item className="login-btn">
                            <Button
                                type="primary"
                                htmlType="submit"
                                disabled={loading}
                                loading={loading}
                            >
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div> */}

            <div
                style={{
                    position: 'absolute',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 400,
                    fontSize: '14px',
                    width: '100%',
                    bottom: '25px',
                    textAlign: 'center',
                    lineHeight: '27px',
                }}
            >
                <span id='icp-color-login'>
                    {' '}
                    ©河北智慧金马科技有限公司|冀ICP备07021621号
                </span>
            </div>
        </div>
    );
};
export default Login;
