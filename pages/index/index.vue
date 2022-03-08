<script setup>
	import { reactive } from 'vue';
	import Tools from 'lg-tools';
	import Utils from '@/utils/index.js';

	// -- constants
	const dotsStyles = {
		background: 'rgb(255, 255, 255)',
		selectedBackgroundColor: "#FFFFFF",
		border: 'none',
		selectedBorder: 'none'
	}
	const safeguards = [
		{ icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/ACT1646214835376.png', label: '时效保障' },
		{ icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/EVS1646214827628.png', label: '服务保障' },
		{ icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/FTS1646214816985.png', label: '质量保障' },
		{ icon: 'https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/QXB1646214789623.png', label: '价格保障' },
	]
	console.log(Tools.randomCharacters(3, 'uppercase') + new Date().getTime())
	// -- state
	const state = reactive({
		current: 0,
		banners: [
			{ img: 'https://img95.699pic.com/photo/40006/9851.jpg_wh300.jpg' },
			{ img: 'https://img95.699pic.com/photo/40006/9851.jpg_wh300.jpg' },
			{ img: 'https://img95.699pic.com/photo/40006/9851.jpg_wh300.jpg' }
		],
		workers: [{
				avatar: 'https://img0.baidu.com/it/u=2427374459,2509009085&fm=253&fmt=auto&app=120&f=JPEG?w=360&h=360',
				name: '李鸿耀',
				phone: '17398888669',
				star: 5
			},
			{
				avatar: 'https://img0.baidu.com/it/u=2427374459,2509009085&fm=253&fmt=auto&app=120&f=JPEG?w=360&h=360',
				name: '李鸿耀',
				phone: '17398888669',
				star: 5
			},
			{
				avatar: 'https://img0.baidu.com/it/u=2427374459,2509009085&fm=253&fmt=auto&app=120&f=JPEG?w=360&h=360',
				name: '李鸿耀',
				phone: '17398888669',
				star: 5
			},
			{
				avatar: 'https://img0.baidu.com/it/u=2427374459,2509009085&fm=253&fmt=auto&app=120&f=JPEG?w=360&h=360',
				name: '李鸿耀',
				phone: '17398888669',
				star: 5
			},
		]
	});
	// -- life circles
	// -- methods
	// -- events
	const onSwiperChange = ({ detail: { current } }) => {
		state.current = current;
	}
	const onCreateOrder = () => {
		Utils.checkLogin().then(() => {
			uni.navigateTo({
				url: '/pages/orders/orders?q=1',
				events: {
					// -- 接收子页面传递的数据
					acceptDataFromOrders: (data) => {
						console.log(data);
					}
				},
				success({ eventChannel }) {
					// -- 向子页面传递数据
					eventChannel.emit('acceptDataFromIndex', { message: 'Hello, 我来自首页~' });
				}
			})
		})
	}
</script>


<template>
	<view class="page">
		<!-- 轮播图 start -->
		<uni-swiper-dot :current="state.current" field="content" mode="round" :info="state.banners" :dotsStyles="dotsStyles">
			<swiper class="swiper" :circular="true" @change="onSwiperChange" autoplay>
				<swiper-item v-for="(banner, index) in state.banners" :key="index">
					<image class="swiper-item" :src="banner.img" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
		</uni-swiper-dot>

		<!-- 轮播图 end -->

		<!-- 保障 & 下单 start -->
		<view class="pt-20 pb-40 px-64 bg-FFFFFF">
			<view class="flex-h-between mb-40">
				<view class="safeguard-item text-center" v-for="item in safeguards" :key="item.icon">
					<image class="icon mb-10" :src="item.icon"></image>
					<view class="f26 lh-36 color-202020">{{item.label}}</view>
				</view>
			</view>
			<button class="order-button f32 bg-1946BB color-FFFFFF rounded-48 flex-h-center" @click="onCreateOrder">立即下单</button>
		</view>
		<!-- 保障 & 下单 end -->

		<!-- 师傅榜 start -->
		<view class="mt-32">
			<view class="workers-h flex-h-center mb-16">
				<view class="line"></view>
				<image class="icon-40x40" src="https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/BOT1646214847478.png"></image>
				<view class="f32 lh-44 color-1946BB ml-2">师傅榜</view>
				<view class="line"></view>
			</view>
			<view class="workers px-20">
				<view class="flex-h-start bg-FFFFFF rounded-12 mb-20 py-36 px-30" v-for="(item, index) in state.workers" :key="index">
					<image class="icon-68x68 rounded-circle flex-shrink" :src="item.avatar"></image>
					<view class="ml-20 w-100">
						<view class="flex-h-between w-100">
							<view class="mr-12 f28 lh-40 color-202020">{{item.name}}</view>
							<view class="star flex-h-center f20">
								<image src="https://yinghong-maintenance.oss-cn-chengdu.aliyuncs.com/icons/HLO1646219098373.png">
								</image>
								{{item.star}}星师傅
							</view>
						</view>
						<view class="f24 lh-34 color-999999">{{Tools.phoneFormatter(item.phone, "$1 **** $3")}}</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 师傅榜 end -->
		<view class="space-200"></view>
	</view>
</template>

<style scoped lang="less">
	.page {
		.swiper-item {
			height: 300rpx;
		}

		.safeguard-item {
			.icon {
				witdh: 98rpx;
				height: 80rpx;
			}
		}

		.order-button {
			width: 400rpx;
			height: 88rpx;
		}

		.workers-h {
			.line {
				width: 107rpx;
				height: 2rpx;
				background-color: #1946BB;
				position: relative;
			}

			.line::before {
				content: '';
				display: inline-block;
				width: 6rpx;
				height: 6rpx;
				border-radius: 50%;
				background-color: #1946BB;
				position: absolute;
				top: -1rpx;
			}

			.line:first-child {
				margin-right: 18rpx;

				&::before {
					right: 0;
				}
			}

			.line:last-child {
				margin-left: 18rpx;

				&::before {
					left: 0;
				}
			}
		}

		.star {
			width: 120rpx;
			height: 32rpx;
			background: #FFD4CE;
			border-radius: 16rpx;
			color: #CE5B78;

			image {
				width: 28rpx;
				height: 24rpx;
			}
		}
	}
</style>
