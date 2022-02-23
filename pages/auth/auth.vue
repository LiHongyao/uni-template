<script setup>
	
	import { reactive, toRefs, onMounted } from 'vue';
	import Tools from 'lg-tools';
	const { $utils } = getApp().globalData;


	// state
	const state = reactive({
		key: "GET_USER_PROFILE", // "GET_USER_PROFILE" | "GET_USER_PHONE",
		canIUseGetUserProfile: false
	});

	// life circles
	onMounted(() => {
		// 1. 判断设备是否支持 getUserProfile
		wx.getUserProfile && (state.canIUseGetUserProfile = true);
		console.log(state.canIUseGetUserProfile);
	})

	// methods
	// events
	// 2.10.4以后获取用户信息
	const onGetUserProfile = () => {
		wx.getUserProfile({
			desc: '用于完善用户头像、昵称展示信息',
			success: (res) => {
				const {
					errMsg,
					encryptedData,
					iv,
					rawData,
					signature
				} = res;
				if (/ok/.test(errMsg)) {
					this.$utils.loading('处理中...');
					this.$api.user.submitMaUserInfo({
						encryptedData,
						iv,
						rawData,
						signature
					}).then(r => {
						if (r && r.code === 0) {
							this.key = "PHONE";
						}
					})
				}
			}
		});
	}
	const {
		key,
		canIUseGetUserProfile
	} = toRefs(state);
</script>


<template>
	<view class="page justify-content-center px-60">
		<template v-if="key === 'GET_USER_PROFILE'">
			<view class="f26 lh-42 color-999999 mb-96">为了我们更好的服务您，D积分小程序需要获取您的基础信息，请点击“授权登录”按钮，打开头像、昵称等信息的授权。</view>
			<button v-if="canIUseGetUserProfile" class="button flex-h-center mb-48"
				@click="onGetUserProfile">授权登录</button>
			<button v-else class="button flex-h-center mb-48" open-type="getUserInfo"
				@getuserinfo="onGetUserInfo">授权登录</button>
			<button class="button flex-h-center cancel" @click="$utils.switchTab('/pages/earn/earn')">取消</button>
		</template>
		<!-- <template v-else>
			<view class="f26 lh-42 color-999999 mb-96">
				为了我们更好的服务您，请使用微信快捷登录D积分，方便又好用！
			</view>
			<button class="button flex-h-center" open-type="getPhoneNumber"
				@getphonenumber="onGetPhoneNumber">
		
				<image class="icon-44x44 mr-8"
					src="https://qn.d-dou.com/dcep/dbean/0ee92ad7a1b6443e87a709e88a967931m6eurq.png">
				</image>
				<text>微信用户快捷登录</text>
			</button>
		</template> -->
	</view>
</template>


<style lang="less" scoped>
	.back-btn {
		background-image: url('https://qn.d-dou.com/dcep/dbean/b21204b44826488cabdc1da986c0a218jiy268.png');
		background-repeat: no-repeat;
		background-size: 38rpx 38rpx;
		background-position: 0 center;
	}

	.button {
		width: 542rpx;
		height: 96rpx;
		background: #3DC264;
		border-radius: 51rpx;

		font-size: 32rpx;
		color: #FFFFFF;

		&.cancel {
			border: 2rpx solid #BEBEBE;
			background: #FFFFFF;
			color: #BEBEBE;
		}
	}
</style>
