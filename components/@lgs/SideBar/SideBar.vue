<!-- 
 注意：
 使用时需固定高度，建议调用者外层容器使用弹性垂直布局
 1. 标签
 <side-bar class="side-wrap" :categories="[{ name, id }]" @refresh="onRefresh" @load="onLoadMore">
		插槽定义右侧内容
 </side-bar>
 2. 样式
 .page {
	 /** 外层容器必须使用弹性布局才生效 */
	 display: flex;
	 flex-direction: column;
 }
 .side-wrap {
	  flex: 1;
		/** 此属性必须设置 */
		position: relative; 
 }
-->
<script setup>
	// -- imports 
	import { reactive, onMounted, nextTick, watch } from 'vue';

	// -- props & emits
	const props = defineProps({
		/** 默认值 */
		defaultValue: { type: [Number, String], default: '' },
		/** 左侧菜单数据列表 */
		categories: { type: Array, required: true, default: () => ([]) },
		/** 游标类型 hStripe-横条，vStripe-竖条，默认：vStripe*/
		cursorType: { type: String, default: "vStripe" },
		/** 游标高度 */
		cursorHeight: { type: [Number, String], default: 68 },
		/** 游标颜色 */
		cursorColor: { type: String, default: "#42b983" },
		/** 侧栏元素高度 */
		sideItemHeight: { type: [Number, String], default: 100 },
		/** 侧栏宽度 */
		sideWidth: { type: [Number, String], default: 160 },
		sideTintColor: { type: String, default: "#A5A5A5" },
		sideActiveColor: { type: String, default: "#FFFFFF" },
		/** 侧栏区域背景色 */
		sideBgColor: { type: String, default: '#F8F8F8' },
		/** 内容区域背景色 */
		contentBgColor: { type: String, default: '#FFFFFF' },
		/** 是否显示边框 */
		bordered: Boolean
	});

	const emits = defineEmits(["load", "refresh"])


	// -- state 
	const state = reactive({
		/** 当前选中的菜单项的value值 */
		value: 0,
		/** 游标的位置 */
		cursorTop: 0,
		/** 游标高度 */
		cursorHeight: uni.upx2px(props.cursorHeight),
		/** 侧栏元素高度 */
		sideItemHeight: uni.upx2px(props.sideItemHeight),
		/** 侧栏宽度 */
		sideWidth: uni.upx2px(props.sideWidth)
	});

	// -- styles 
	const styles = {
		'--side-width': state.sideWidth + 'px',
		'--cursor-color': props.cursorColor,
		'--side-bg-color': props.sideBgColor,
		'--content-bg-color': props.contentBgColor,
		'--side-tint-color': props.sideTintColor,
		'--side-active-color': props.sideActiveColor,
	}

	// -- life circles
	onMounted(() => {
		// init(); // 注释原因：通过watch监听自动调用
	});
	// -- methods 
	const init = (data) => {
		if (data && data.length > 0) {
			// -- 处理默认选中项
			let index = props.categories.findIndex(item => item.id === props.defaultValue);
			if (index === -1) {
				index = 0;
				state.value = props.categories[0].id;
			} else {
				state.value = props.categories[index].id;
			}
			// -- 计算游标初始位置(竖条)
			if (props.cursorType === 'vStripe') {
				nextTick(() => {
					state.cursorTop = index * state.sideItemHeight + (state.sideItemHeight / 2 - state.cursorHeight / 2)
				});
			}
			// -- 触发更新
			emits("refresh", { value: state.value })
		}
	}
	// -- events
	// -- 点击左侧菜单栏
	const onsideItemTap = (value, index) => {
		// -- 更新值
		state.value = value;
		// -- 更新游标位置(竖条)
		if (props.cursorType === 'vStripe') {
			state.cursorTop = index * state.sideItemHeight + (state.sideItemHeight / 2 - state.cursorHeight / 2)
		}
		// -- 触发更新
		emits("refresh", { value })
	}

	// -- watchs
	watch(() => props.categories, (data) => { init(data) }, { immediate: true, deep: true });
</script>

<template>
	<view class="lg-side-bar" :class="{bordered: !!bordered}" :style="styles">
		<!-- 侧边栏 -->
		<scroll-view class="lg-side-bar__side" scroll-y>
			<!-- 数据 -->
			<block v-for="(item, index) in categories" :key="index">
				<view class="__side-item" :class="{selected: item.id === state.value, hStripe: props.cursorType === 'hStripe' }" :style="{height: state.sideItemHeight + 'px' }" @click="onsideItemTap(item.id, index)">
					<text style="position: relative; z-index: 1;">{{item.name}}</text>
				</view>
			</block>
			<!-- 游标（仅在类型为vStripe且数据有值时展示） -->
			<view v-if="cursorType === 'vStripe' && categories.length > 0" class="__cursor" :style="{top: state.cursorTop + 'px', height: state.cursorHeight + 'px'}"></view>
		</scroll-view>
		<!-- 内容区域 -->
		<scroll-view class="lg-side-bar__contents " scroll-y @scrolltolower="emits('load', { value: state.value})" :lower-threshold="20">
			<slot></slot>
		</scroll-view>
	</view>
</template>


<style lang="less" scoped>
	.lg-side-bar {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;

		&.bordered {
			border-top: 2rpx solid #F7F7F7;
		}

		&__side {
			width: var(--side-width);
			height: 100%;
			background-color: var(--side-bg-color);
			position: relative;
			flex-shrink: 0;

			.__cursor {
				width: 6rpx;
				background-color: var(--cursor-color);
				position: absolute;
				left: 2rpx;
				transition: top .25s ease-in-out;
			}

			.__side-item {
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 28rpx;
				color: var(--side-tint-color);
				position: relative;
				transition: background-color .25s linear;

				&.hStripe::after {
					content: "";
					display: none;
					width: 80rpx;
					height: 8rpx;
					background: linear-gradient(90deg, var(--cursor-color) 40%, rgba(247, 223, 185, 0) 100%);
					border-radius: 4rpx;
					position: absolute;
					bottom: 35rpx;
					left: 50%;
					transform: translateX(-50%);
				}

				&.selected {
					background-color: var(--side-active-color);
				}

				&.selected.hStripe::after {
					display: block;
				}
			}
		}

		&__contents {
			flex: 1;
			height: 100%;
			background-color: var(--content-bg-color);
		}
	}
</style>