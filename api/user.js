import request from '@/utils/request.js';

/**
 * POST：登录
 * @param {Object} code
 */
export function login(code) {
	return request({
		url: '/api/xxx',
		data: { code },
		method: 'POST'
	})
}


/**
 * GET：查询用户信息
 */
export function info() {
	return request({
		url: '/api/xxx'
	})
}
