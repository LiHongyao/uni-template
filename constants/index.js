// -- 请求域名相关
const APP_HOST_DEV = '开发环境';
const APP_HOST_TES = '测试环境';
const APP_HOST_PRO = '生产环境';

export const APP_HOST = APP_HOST_PRO;


// -- Oss-Host
export const APP_OSS_HOST = "https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com";

// -- Keys
export const APP_KEY_TOKEN = "YHWX_TOKEN"; /** 记录登录token */
export const APP_KEY_PHONE = 'YHWX_HAS_BIND_PHONE'; /** 记录是否绑定手机号 **/


// -- 杂项信息
export const APP_MINE_FNS = [
	{ label: '地址管理', path: '' },
	{ label: '我的客服', path: '' },
	{ label: '用户协议', path: '/pages/web-page/web-page?q=1' },
	{ label: '隐私政策', path: '/pages/web-page/web-page?q=2' },
]

export const APP_MINE_ORDERS = [{
		icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/GDZ1646219701427.png',
		path: '/pages/orders/orders?q=0',
		label: '待确认'
	},
	{
		icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/VEQ1646219710128.png',
		path: '/pages/orders/orders?q=1',
		label: '待上门'
	},
	{
		icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/FBS1646219716396.png',
		path: '/pages/orders/orders?q=2',
		label: '已完成'
	},
	{
		icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/WMR1646219722800.png',
		path: '/pages/orders/orders?q=3',
		label: '返修/售后'
	}
];
