export default class Utils {
	/**
	 * 关注公众号
	 */
	static subscribeMp() {
		uni.previewImage({
			urls: [
				'https://qn.d-dou.com/dcep/dbean/4278855d38954d89a5095b9f6e637071ri1m0p.png'
			],
			indicator: "none"
		})
	}

	/**
	 * 企业微信
	 */
	static enterpriseWx() {
		uni.previewImage({
			urls: [
				'https://qn.d-dou.com/dcep/dbean/4068932c9f9f4b4bafabe34c43f6fb833zlvce.png'
			],
			indicator: "none"
		})
	}
	/**
	 * 播放音频
	 * 测试音频地址：https://qn.d-dou.com/dpoint/media/aigei_com.mp3
	 * @param {string} src 音频地址
	 * @param {boolean} loop 是否循環播放
	 * @return  ctx上下文
	 */
	static playAudio(src, loop = false) {
		const ctx = uni.createInnerAudioContext();
		ctx.src = src;
		ctx.autoplay = true;
		ctx.loop = loop;
		ctx.onEnded(() => {
			ctx.offError();
			ctx.offEnded();
			if (!loop) {
				ctx.destroy();
			}
		})
		ctx.onError((res) => {
			console.log(res.errMsg);
			console.log(res.errCode);
		});
		return ctx;
	}
	
	/**
	 * 轻提示
	 * @param {Object} title
	 */
	static toast(title) {
		uni.showToast({
			title,
			icon: 'none'
		})
	}

	/** 加载动画
	 * @param {Object} title
	 */
	static loading(title) {
		uni.showLoading({
			title,
			duration: 20 * 1000
		})
	}

	/**
	 * 页面入栈
	 * @param {Object} url
	 */
	static push(url) {
		uni.navigateTo({
			url
		})
	}

	/**
	 * 页面出栈
	 */
	static pop(delta = 1) {
		uni.navigateBack({
			delta
		})
	}
	/**
	 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页
	 * @param {Object} url
	 */
	static switchTab(url) {
		uni.switchTab({
			url
		})
	}


	/**
	 * 登录
	 * @param {type} fetch 后台api登录接口函数
	 */
	static login({
		loginFn,
		shareCode,
		editFn
	}) {
		return new Promise((resolve, reject) => {
			// 1. 处理请求参数
			let scopes;
			let provider;
			let withCredentials;
			// #ifdef MP-WEIXIN
			provider = 'weixin';
			withCredentials = true;
			// #endif
			// #ifdef MP-ALIPAY
			provider = 'alipay';
			scopes = ['auth_user'];
			// #endif

			// 2. 获取code
			uni.login({
				provider,
				scopes,
				withCredentials,
				success({
					code,
					authCode
				}) {
					// #ifdef MP-ALIPAY
					code = authCode;
					// #endif

					// 3. 调用登录接口
					loginFn && loginFn({
						code,
						shareCode
					}).then(r => {
						if (r && r.code === 0) {
							// 4. 存储 token & 手机绑定状态
							const {
								hasBindPhone,
								token
							} = r.data;
							uni.setStorageSync("DPMP_TOKEN", token);
							uni.setStorageSync("DPMP_HAS_BIND_PHOINE", hasBindPhone);
							resolve();
						}
					})
				},
				fail() {
					reject();
					Utils.toast('微信登录授权失败');
				}
			})
		})
	}

	/**
	 * 检查是否绑定手机号
	 */
	static checkBindPhone() {
		return new Promise((resolve, reject) => {
			if (uni.getStorageSync("HAS_BIND_PHOINE")) {
				resolve();
			} else {
				uni.navigateTo({
					url: '/pages/auth/auth'
				})
			}
		})
	}


	/**
	 * 统计上报
	 */
	static trackEs(event_name, data = {}) {
		// #ifdef MP-WEIXIN
		wx.reportAnalytics(event_name, data);
		// #endif
	}

	/**
	 * 获取定位信息
	 */
	static getLocation() {
		return new Promise((resolve) => {
			// 直接获取用户定位信息 / 获取失败则做后续处理
			uni.getLocation({
				success({
					errMsg,
					latitude,
					longitude
				}) {
					if (/ok/.test(errMsg)) {
						resolve({
							lat: latitude,
							lng: longitude
						});
					} else {
						resolve({});
					}
				},
				fail() {
					// 调用失败 / 表示用户未授权
					// 判断是否是第1次进入 ，如果是第1次进入，在拒绝授权后不再弹框
					if (!uni.getStorageSync('UN_FIRSTIN')) {
						uni.setStorageSync('UN_FIRSTIN', true);
						resolve({});
						return;
					}
					// 如果不是第1次进入，再次弹框让用户授权
					uni.getSetting({
						success(res) {
							// 判断用户是否授权获取定位信息
							if (!res.authSetting['scope.userLocation']) {
								uni.showModal({
									title: "授权获取你的位置信息",
									content: "用于定位当前位置和商家的距离",
									success(r) {
										if (r.confirm) {
											// 如果用户同意授权地理信息，则打开授权设置页面，判断用户的操作
											uni.openSetting({
												success(data) {
													// 如果用户授权了地理信息在， 则提示授权成功
													if (data.authSetting[
															'scope.userLocation'
														]) {
														uni.getLocation({
															success({
																errMsg,
																latitude,
																longitude
															}) {
																if (/ok/
																	.test(
																		errMsg
																	)
																) {
																	resolve
																		({
																			lat: latitude,
																			lng: longitude
																		});
																} else {
																	resolve
																		({});
																}
															},
														})

													} else {
														resolve({});
													}
												}
											})
										} else {
											resolve({});
										}
									}
								})
							}
						},
						fail() {
							resolve({});
						}
					})
				}
			})
		})
	}
	/**
	 * 订阅授权
	 */
	static checkSubscriptions() {
		uni.getSetting({
			withSubscriptions: true,
			success(res) {
				console.log(res)
				uni.showModal({
					title: "授权获取你的订阅",
					content: "用于定位当前位置和商家的距离",
					success(r) {
						if (r.confirm) {
							uni.openSetting({
								withSubscriptions: true,
								success(res) {
									console.log(res);
								}
							})
						}
					}
				})

			}
		})
	}
}
