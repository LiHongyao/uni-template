<script setup>
	import { reactive, onMounted } from 'vue';
	import Tools from 'lg-tools';
	import Bus from 'lg-bus';
	import Utils from '@/utils/index.js';
	import { APP_KEY_PHONE, APP_MINE_FNS, APP_MINE_ORDERS } from '@/constants/index.js';

	// -- constants

	// -- state
	const state = reactive({
		isLogin: uni.getStorageSync(APP_KEY_PHONE)
	});

	// -- life circles
	onMounted(() => {
		// 1. 监听绑定手机
		Bus.$on("BINDED_PHONE", () => {
			state.isLogin = true;
		});
	})

	// -- events
	const onOrderItemTap = (url) => {
		Utils.checkLogin().then(r => {
			// ...
		})
	}

	const onSwitchRole = () => {
		Utils.toast("您当前还不是师傅哟~")
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
			<view class="wrap pl-40 flex-h-between rounded-24 bg-FFFFFF">
				<view class="flex-h-start">
					<template v-if="state.isLogin">
						<image class="icon-96x96 rounded-circle" src="https://img0.baidu.com/it/u=2427374459,2509009085&fm=253&fmt=auto&app=120&f=JPEG?w=360&h=360">
						</image>
						<view class="ml-24">
							<view class="f32 lh-44 f-600 color-202020">LiKG</view>
							<view class="f28 lh-40 f-400 color-999999">17398888669</view>
						</view>
					</template>
					<template v-else>
						<image class="icon-96x96 rounded-circle" src="https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/WOT1646215161264.png">
						</image>
						<view class="f32 f-600 color-202020 ml-24" @click="Utils.push('/pages/auth/auth')">立即登录
						</view>
					</template>
				</view>
				<view v-if="state.isLogin" class="switch flex-h-center f28 f-40" @click="onSwitchRole">切换为师傅</view>
			</view>
			<!-- 我的订单 -->
			<view class="orders pt-30 pb-40 px-30 rounded-24 bg-FFFFFF mt-40">
				<view class="flex-h-between">
					<view class="f32 lh-44 f-600 color-202020">我的订单</view>
					<view class="flex-h-center">
						<text class="f24 lh-34 color-999999 mr-8">全部订单</text>
						<image class="icon-arrow" src="https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/EIL1646219729607.png">
						</image>
					</view>
				</view>
				<view class="flex-h-around mt-32">
					<block v-for="item in APP_MINE_ORDERS" :key="item.icon">
						<view class="flex-v-center" @click="onOrderItemTap(item.path)">
							<image style="width: 60rpx; height:58rpx;" :src="item.icon"></image>
							<text class="f26 lh-36 color-202020 mt-16">{{item.label}}</text>
						</view>
					</block>
				</view>
			</view>
			<!-- 功能列表 -->
			<view class="fns bg-FFFFFF pl-30 mt-20 rounded-24">
				<block v-for="(item, index) in APP_MINE_FNS" :key="item.label">
					<view class="py-30 flex-h-between " :class="index !== 3 ? 'border-bottom' : ''">
						<text class="f28 lh-40 f-400 color-444444">{{item.label}}</text>
						<image class="icon-arrow mr-40" src="https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/EIL1646219729607.png">
						</image>
					</view>
				</block>
			</view>
		</view>
		<!-- 内容 end -->
	</view>
</template>

<style scoped lang="less">
	.page {
		.icon-arrow {
			width: 10rpx;
			height: 16rpx;
		}

		.top-bar {
			padding-top: 108rpx;
			height: 280rpx;
			background: linear-gradient(90deg, #7DA1FF 0%, #1946BB 100%);
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
