<script setup>
	import { reactive, toRefs, onMounted } from 'vue';
	import Tools from 'lg-tools';
	import Bus from 'lg-bus';
	import Utils from '@/utils/index.js';
	import { APP_KEY_TOKEN, APP_KEY_PHONE } from '@/constants/index.js';

	// -- state
	const state = reactive({
		key: "GET_USER_PROFILE", // "GET_USER_PROFILE" | "GET_USER_PHONE",
		canIUseGetUserProfile: false
	});

	// -- life circles
	onMounted(() => {
		// 1. 判断设备是否支持 getUserProfile
		wx.getUserProfile && (state.canIUseGetUserProfile = true);
		
	})

	// -- methods
	// -- events
	const onGetUserInfo = ({ detail }) => {
		const { errMsg, encryptedData, iv, rawData, signature } = detail;
		if (/ok/.test(errMsg)) {
			// Utils.loading('处理中...');
			// 调用接口更新用户信息
			state.key = 'GET_USER_PHONE';
		}
	}
	const onGetUserProfile = () => {
		wx.getUserProfile({
			desc: '用于完善用户头像、昵称展示信息',
			success: (res) => {
				const { errMsg, encryptedData, iv, rawData, signature } = res;
				if (/ok/.test(errMsg)) {
					// Utils.loading('处理中...');
					// 调用接口更新用户信息
					state.key = 'GET_USER_PHONE';
				}
			}
		});
	}
	const onGetPhoneNumber = ({ detail }) => {
		const { errMsg, encryptedData, iv } = detail;
		uni.setStorageSync(APP_KEY_PHONE, true);
		Bus.$emit("BINDED_PHONE");
		Utils.navigateBack();
		/*
		if (/ok/.test(errMsg)) {
			this.$api.user.bindMaPhone({ encryptedData, iv }).then(r => {
				if (r && r.code === 0) {
					uni.setStorageSync(APP_KEY_TOKEN, r.data.token);
					uni.setStorageSync(APP_KEY_PHONE, true);
					this.$bus.$emit('BINDED_PHONE');
					Utils.navigateBack();
				}
			})
		} else {
			Utils.navigateBack();
		}*/

	}
	const onBack = () => {
		Utils.navigateBack();
	}
	const { key, canIUseGetUserProfile } = toRefs(state);
</script>


<template>
	<view class="page">
		<view class="wrap rounded-24 bg-FFFFFF pt-70 px-48 mx-auto flex-v-center justify-content-start">
			<!-- logo -->
			<image class="icon-160x160"
				src="https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/WOT1646215161264.png"></image>
			<!-- 店铺名称 -->
			<view class="f32 f-600 lh-44 mt-20" style="color: #202020;">英洪维修</view>
			<!-- 获取用户信息 -->
			<template v-if="key === 'GET_USER_PROFILE'">
				<view class="desc">为了我们更好的服务您，英洪维修小程序需要获取您的基础信息，请点击“授权登录”按钮，打开头像、昵称等信息的授权。</view>
				<button v-if="canIUseGetUserProfile" class="button flex-h-center" @click="onGetUserProfile">授权登录</button>
				<button v-else class="button flex-h-center" open-type="getUserInfo" @getuserinfo="onGetUserInfo">授权登录</button>
			</template>
			<template v-else>
				<view class="desc">为了我们更好的服务您，请使用微信快捷登录获取您的手机号码</view>
				<button class="button flex-h-center" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
					<image class="icon-44x44 mr-8"
						src="https://qn.d-dou.com/dcep/dbean/0ee92ad7a1b6443e87a709e88a967931m6eurq.png"></image>
					<text>微信快捷登录</text>
				</button>
			</template>
			<!-- 暂不登录 -->
			<view class="f28 lh-40 mt-40 f-400" style="color:#202020;" @click="onBack">暂不登录</view>
		</view>


	</view>
</template>


<style lang="less" scoped>
	.page {
		background-image: url('https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/UMR1646215168771.png');
		background-repeat: no-repeat;
		background-size: 100% auto;
		background-position: top left;
		padding-top: 180rpx;

		.wrap {
			width: 670rpx;
			height: 884rpx;
		}

		.desc {
			height: 108rpx;
			margin-top: 40rpx;
			font-size: 26rpx;
			color: #999999;
		}

		.button {
			width: 400rpx;
			height: 88rpx;
			color: #FFFFFF;
			font-size: 32rpx;
			background: #1946BB;
			border-radius: 48rpx;
			margin-top: 100rpx;
		}
	}
</style>
