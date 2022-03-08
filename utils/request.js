import { APP_HOST, APP_KEY_TOKEN } from '@/constants/index.js';


let requestQueue = []; // 请求队列
let isRefreshingToken = false; // Token刷新状态

/**
 * 请求对象
 * @param  {string} url 
 * @param  {string} method 'GET' | 'POST'
 * @param  {object} data
 * @param  {object} headers   
 * @return { Promise }     
 */
const request = (options) => {
	return new Promise((resolve, reject) => {
		// -- 处理默认配置
		const defaultOptions = { method: 'GET' };
		// -- 合并配置
		Object.assign(defaultOptions, options);
		// -- 解构配置
		let { method, url, data = {}, headers = {} } = defaultOptions;
		// -- 处理GET请求
		const timeStamp = new Date().getTime();
		if (method === 'GET') {
			data.timeStamp = timeStamp;
		}
		// -- 处理URL，如果传递完整请求地址(特殊请求)，则不做拼接处理
		if (!/^http(s?)/.test(url)) {
			url = `${APP_HOST}${url}`
		};

		// 发送请求
		uni.request({
			url,
			method,
			data,
			timeout: 20 * 1000,
			header: {
				...{
					"Content-Type": "application/json",
					"Authorization": 'Bearer ' +  uni.getStorageSync(APP_KEY_TOKEN),
				},
				...headers
			},
			success: (response) => {
				uni.hideLoading();
				if (response.statusCode === 200) {
					const { code, msg } = response.data;
					switch (code) {
						case 200:
							resolve(response.data);
							break;
						case -10:
							// 是否正在刷新token
							// if (isRefreshingToken) {
							// 	console.log('放入任务队列~')
							// 	return new Promise(resolve => {
							// 		requestQueue.push(() => {
							// 			resolve(request(options));
							// 		})
							// 	})
							// } else {
							// 	isRefreshingToken = true;
							// 	// 刷新Token
							// 	setTimeout(() => {
							// 		uni.setStorageSync('DPMP_TOKEN', '1c092c30daabe53b467144d93292e96cb070beee0fe97af1dad2baa62941a6fef81e1af67602937754fb55d9871258e07e93deac1b82e8992d59b3d3926d209f10a2a196b135a0ea2fa3cf61b8e98e29');
							// 		console.log('token刷新成功');
							// 		// 执行任务队列
							// 		requestQueue.forEach(cb => cb());
							// 		requestQueue = [];
							// 		isRefreshingToken = false;
							// 		// 重试本次请求
							// 		return request(options);
							// 	}, 1000);
							// }
							break;
						default:
							uni.showToast({ title: msg || '服务器忙，请稍后再试！', icon: 'none' });
					}
				}
			},
			fail: (err) => {
				uni.hideLoading();
				console.log('AJAX_ERROR：', err)
			},
			complete: () => {}
		})
	});
};
export default request;
