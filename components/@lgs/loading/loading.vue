<script setup>
	import { defineProps } from 'vue';
	const props = defineProps({
		logo: { type: String, default: '' },
		tips: { type: String, default: "数据加载中..." },
		showTips: { type: Boolean, default: true },
		top: { type: Number, default: 100 },
	})
</script>


<template>
	<view class="lg-loading" :style="{ paddingTop: `${top}rpx` }">
		<view class="lg-loading__ct">
			<image class="lg-loading__logo" :src="logo || './images/logo_2.png'" />
			<view class="lg-loading__border"></view>
		</view>
		<view v-if="showTips" class="lg-loading__tips">{{tips}}</view>
	</view>
</template>


<style lang="less" scoped>
	.lg-loading {
		text-align: center;

		&__ct {
			position: relative;
			width: 128rpx;
			height: 128rpx;
			margin: 0 auto;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		&__logo {
			width: 44rpx;
			height: 44rpx;
			position: relative;
			z-index: 2;
		}

		&__border {
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			background: url("./images/border_1.png") center center no-repeat;
			background-size: contain;
			-webkit-animation: rotate 1s linear infinite;
			animation: rotate 1s linear infinite;
			z-index: 1;
		}

		&__tips {
			font-size: 24rpx;
			margin-top: 24rpx;
			letter-spacing: 2rpx;
			color: #999999;
		}

		@keyframes rotate {
			to {
				transform: rotateZ(360deg);
			}
		}

		@-webkit-keyframes rotate {
			to {
				-webkit-transform: rotateZ(360deg);
			}
		}
	}
</style>
