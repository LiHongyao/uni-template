<script setup>
	import { onLoad } from '@dcloudio/uni-app';
	import { reactive, ref } from 'vue';
	import Tools from '@likg/tools';
	import Bus from '@likg/bus';
	import Utils from '@/utils';
	import Dialog from '@/components/@lgs/Dialog/Dialog.vue';
	import { APP_KEY_LOGIN, APP_MINE_FNS, APP_MINE_ORDERS } from '@/constants';


	// -- constants

	// -- refs
	const dialog = ref();

	// -- state
	const state = reactive({
		isLogin: uni.getStorageSync(APP_KEY_LOGIN)
	});

	// -- life circles
	onLoad(() => {
		// 1. 监听绑定手机
		Bus.$on("LOGGED", () => {
			state.isLogin = true;
			uni.setStorageSync(APP_KEY_LOGIN, true);
		});
		// 2. ...
	})

	// -- events
	const onOrderItemTap = (path) => {
		Utils.checkLogin().then(() => {
			Utils.push(path);
		})
	}


	const onFnsItemTap = ({ label, path, checkLogin }) => {
		if (label === "我的客服") {
			dialog.value.open({
				content: "客服热线：17398888669",
				confirmText: "立即拨打",
				confirmBgColor: "#42b983",
				onConfirm: () => {
					uni.makePhoneCall({
						phoneNumber: '17398888669',
						fail: () => {

						}
					});
				}
			})
		} else if (checkLogin) {
			Utils.checkLogin().then(() => {
				Utils.push(path);
			})
		} else {
			Utils.push(path);
		}
	}

	const onJumpToUserinfo = () => {
		if (state.isLogin) {
			Utils.push('/pages/userinfo/userinfo')
		}
	}
</script>


<template>

	<view class="page">
		<!-- 头部 start -->
		<view class="top-bar f32 f-600 color-FFFFFF text-center ">个人中心</view>
		<!-- 头部 end -->

		<!-- 内容 start -->
		<view class="contents px-20">
			<!-- 用户信息 -->
			<view class="wrap pl-40 flex-h-between rounded-24 bg-secondary" @click="onJumpToUserinfo">
				<view class="flex-h-start">
					<template v-if="state.isLogin">
						<image class="icon-96x96 rounded-circle" src="../../static/avatar.jpeg">
						</image>
						<view class="ml-24 ff-DIN-Bold">
							<view class="f32 lh-44 f-600 color-secondary">LiKG</view>
							<view class="f28 lh-40 f-400 color-999999 ">17398888669</view>
						</view>
					</template>
					<template v-else>
						<image class="icon-96x96 rounded-circle" src="@/static/logo.png" />
						<view class="f32 f-600 color-secondary ml-24" @click.stop="Utils.push('/pages/auth/auth')">立即登录
						</view>
					</template>
				</view>
				<view v-if="state.isLogin" class="switch flex-h-center f28 f-40 ">普通会员</view>
			</view>
			<!-- 我的订单 -->
			<view class="orders pt-30 pb-40 px-30 rounded-24 bg-secondary mt-40">
				<view class="flex-h-between">
					<view class="f32 lh-44 f-600 color-secondary">我的订单</view>
					<view class="flex-h-center" @click="onOrderItemTap('/pages/orders/list')">
						<text class="f24 lh-34 color-999999 mr-8">全部订单</text>
						<image class="icon-36x36" src="@/static/images/icon_right.png" />
					</view>
				</view>
				<view class="flex-h-around mt-32">
					<block v-for="item in APP_MINE_ORDERS" :key="item.icon">
						<view class="flex-v-center" @click="onOrderItemTap(item.path)">
							<image class="icon-64x64" :src="item.icon"></image>
							<text class="f26 lh-36 color-secondary mt-16">{{item.label}}</text>
						</view>
					</block>
				</view>
			</view>
			<!-- 功能列表 -->
			<view class="fns bg-secondary pl-30 mt-20 rounded-24">
				<block v-for="(item, index) in APP_MINE_FNS" :key="item.label">
					<view class="py-30 flex-h-between " :class="index !== APP_MINE_FNS.length - 1 ? 'border-bottom' : ''" @click="onFnsItemTap(item)">
						<text class="f28 lh-40 f-400 color-444444">{{item.label}}</text>
						<image class="icon-40x40 mr-40" src="@/static/images/icon_right.png"></image>
					</view>
				</block>
			</view>
		</view>
		<!-- popups -->
		<Dialog ref="dialog" />
		<!-- 内容 end -->
	</view>
</template>

<style scoped lang="less">
	.page {


		.top-bar {
			padding-top: 108rpx;
			height: 280rpx;
			background: linear-gradient(90deg, #90EE90 0%, #42b983 100%);
		}

		.contents {
			margin-top: -100rpx;
		}

		.wrap {
			height: 176rpx;
			box-shadow: 0 6rpx 12rpx rgba(25, 70, 187, 0.15);

			.switch {
				width: 160rpx;
				height: 60rpx;
				background: #F5DF4E;
				border-radius: 20rpx 0 0 20rpx;
				color: #685E18;
			}
		}
	}
</style>