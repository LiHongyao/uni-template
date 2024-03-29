<script setup>
	// -- 参考：https://developers.weixin.qq.com/community/develop/article/doc/000e4e66d4c210ae234a10a855ac13
	import { getCurrentInstance, onBeforeMount, onMounted, reactive, watch } from "vue";
	// -- props 
	const props = defineProps({
		/** 圆环进度百分比值 */
		percent: {
			type: Number,
			default: 0,
			validator: val => {
				return val >= 0 && val <= 100
			}
		},
		/** 整个圆形的宽度，单位rpx */
		width: { type: [Number, String], default: 152 },
		/** 圆环线条的宽度，单位rpx */
		borderWidth: { type: [Number, String], default: 12 },
		/** 整个圆环进度区域的背景色 */
		bgColor: { type: String, default: "transparent" },
		/** 底部圆环的颜色（灰色的圆环） */
		inactiveColor: { type: String, default: "#E1E1E6" },
		/** 圆环激活部分的颜色，如果设置gradientColors，该值无效 */
		activeColor: { type: String, default: "#83EDCA" },
		/** 渐变色，格式：Array<{offset, color}>*/
		gradientColors: Array,
		/** 整个圆环执行一圈的时间，单位ms */
		duration: { type: [Number, String], default: 1500 },
		/** 描述信息 */
		extra: String,
		/** 百分比样式 */
		percentStyle: String,
		/** 描述信息样式 */
		extraStyle: String,
		/** 角标样式 */
		angleStyle: String,
	});


	// -- state 
	const state = reactive({
		elBgId: Math.ceil(Math.random() * 10e5).toString(36), // 底部canvas-id
		elId: Math.ceil(Math.random() * 10e5).toString(36), // 激活canvas-id
		instance: null, // 当前组件实例
		widthPx: uni.upx2px(props.width), // 容器宽度
		borderWidthPx: uni.upx2px(props.borderWidth), // 线条出席
		startAngle: -Math.PI / 2, // canvas画圆的起始角度，默认为3点钟方向，定位到12点钟方向
		progressContext: null, // 活动圆的canvas上下文
		newPercent: props.percent, // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
		oldPercent: 0 // 当动态修改进度值的时候，保存进度值的变化前后值，用于比较用
	})
	// -- life circles
	onMounted(() => {
		// 1. 获取当前组件实例
		state.instance = getCurrentInstance();
		// 2. 开始绘制
		setTimeout(() => {
			drawProgressBg();
			drawCircleByProgress(state.oldPercent)
		}, 50)
	});
	// -- methods
	const drawProgressBg = () => {
		const ctx = uni.createCanvasContext(state.elBgId, state.instance);
		ctx.setLineWidth(state.borderWidthPx); // 设置线条粗细（圆环宽度）
		ctx.setStrokeStyle(props.inactiveColor); // 线条颜色
		ctx.beginPath(); // 开始描绘路径
		const radius = state.widthPx / 2; // 计算圆心
		ctx.arc(radius, radius, radius - state.borderWidthPx / 2, 0, 2 * Math.PI, false);
		ctx.stroke(); // 对路径进行描绘
		ctx.draw();
	}
	const drawCircleByProgress = (progress) => {
		// 第一次操作进度环时将上下文保存到了state.progressContext中，直接使用即可
		let ctx = state.progressContext;
		if (!ctx) {
			ctx = uni.createCanvasContext(state.elId, state.instance);
			state.progressContext = ctx;
		}
		// 设置进度的两端为圆形
		ctx.setLineCap('round');
		// 设置线条的宽度
		ctx.setLineWidth(state.borderWidthPx);
		// 计算线条颜色
		let strokeStyle = props.activeColor;
		if (props.gradientColors && props.gradientColors.length >= 2) {
			const g = ctx.createLinearGradient(state.widthPx / 2, 0, 0, state.widthPx / 2);
			props.gradientColors.forEach(({ offset, color }) => {
				g.addColorStop(offset, color);
			});
			strokeStyle = g;
		}
		ctx.setStrokeStyle(strokeStyle);
		// 将总过渡时间除以100，得出每修改百分之一进度所需的时间
		const time = Math.floor(state.duration / 100);
		// 结束角的计算依据为：将2π分为100份，乘以当前的进度值，得出终止点的弧度值，加起始角
		// 为整个圆从默认的3点钟方向开始画图，转为更好理解的12点钟方向开始作图，这需要起始角和终止角同时加上state.startAngle值
		const endAngle = ((2 * Math.PI) / 100) * progress + state.startAngle;
		ctx.beginPath();
		// 半径为整个canvas宽度的一半
		const radius = state.widthPx / 2;
		ctx.arc(radius, radius, radius - state.borderWidthPx / 2, state.startAngle, endAngle, false);
		ctx.stroke();
		ctx.draw();
		// 新值 > 旧值，增加百分比
		if (state.newPercent > state.oldPercent) {
			progress++;
			if (progress > state.newPercent) return;
		} else {
			progress--;
			if (progress < state.newPercent) return;
		}
		setTimeout(() => {
			// 定时器，每次操作间隔为time值，为了让进度条有动画效果
			drawCircleByProgress(progress);
		}, time);
	}

	// -- watchs 
	watch(() => props.percent, (nVal, oVal = 0) => {
		if (nVal > 100) nVal = 100;
		if (nVal < 0) nVal = 0;
		state.newPercent = nVal;
		state.oldPercent = oVal;
		setTimeout(() => {
			// 无论是百分比值增加还是减少，需要操作还是原来的旧的百分比值
			// 将此值减少或者新增到新的百分比值
			drawCircleByProgress(oVal);
		}, 50);
	})
</script>




<template>
	<view class="lg-circle-progress" :style="{width: state.widthPx + 'px', height: state.widthPx + 'px', background: bgColor}">
		<!-- 底部圆 -->
		<canvas :id="state.elBgId" :canvas-id="state.elBgId" class="lg-canvas-bg" :style="{width: state.widthPx + 'px', height: state.widthPx + 'px'}"></canvas>
		<!-- 进度圆 -->
		<canvas :id="state.elId" :canvas-id="state.elId" class="lg-canvas" :style="{width: state.widthPx + 'px', height: state.widthPx + 'px'}"></canvas>
		<!-- 插槽内容 -->
		<slot>
			<view class="__content">
				<view class="__percent" :style="percentStyle">
					<text>{{percent}}</text>
					<text v-if="props.extra" class="sup" :style="angleStyle">%</text>
					<text v-else>%</text>
				</view>
				<view v-if="props.extra" class="__extra" :style="extraStyle">{{extra}}</view>
			</view>
		</slot>
	</view>
</template>


<style lang="less" scoped>
	.lg-circle-progress {
		position: relative;
		border-radius: 50%;

		.__content {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-family: Arial, Helvetica, sans-serif;
			text-align: center;

			.__percent {
				font-size: 28rpx;
				font-weight: 800;
				position: relative;

				.sup {
					font-size: 20rpx;
					position: absolute;
					top: 0;
					left: 100%;
				}
			}

			.__extra {
				font-size: 20rpx;
				color: #666666;
			}
		}

		.lg-canvas,
		.lg-canvas-bg {
			position: absolute;
		}
	}
</style>