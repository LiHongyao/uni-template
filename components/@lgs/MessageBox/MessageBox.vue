<!-- 温馨提示：MessageBox存展示组件，所有的状态显示需调用者控制 -->
<!-- 关于属性 -->
<!-- @meta：元数据，为了方便操作，建议至少包含如下属性 -->
<!-- { readStatus, isPlaying, duration } -->

<script setup>
	// -- imports 
	import { onMounted, reactive } from "vue";

	// -- props 
	const props = defineProps({
		/** 消息内容，仅支持音频/文本/图片格式（必传） */
		message: String,
		/** 语音描述 */
		audioText: String,
		/** 用户头像（必传） */
		avatar: String,
		/** 源数据，事件触发时作为事件参数回传给调用者（必传） */
		meta: Object,
		/** 消息框位置：L（左侧-好友）/R（右侧-自己），默认值：R */
		align: { type: String, default: "R" },
		/** 音频时设置：阅读状态，0-未读，1-已读 */
		readStatus: { type: Number, default: 1 },
		/** 音频时设置：播放状态，标识音频消息当前是否处于播放中（用于控制音频消息动效） */
		isPlaying: Boolean,
		/** 音频时设置：持续时间，单位秒 */
		duration: { type: Number, default: 0 },
		/** 音频时设置：最长时间，单位秒，用于动态计算语音消息框的宽度 */
		maxDuration: { type: Number, default: 60 },
		/** 音频时设置： 音频播放状态动画类型，可选值：line-线条 horn-喇叭 */
		aniType: { type: String, default: "horn" },
		/** 颜色配置项 */
		colorOptions: {
			type: Object,
			default: () => ({})
		},
		/** 展示Loading动画，只针对消息内容为文本且只显示一行时有效（显示正常） */
		showLoading: Boolean,
		/** 展示icon，只针对消息内容为文本且只显示一行时时有效（显示正常）*/
		showIcon: Boolean,
		/** 展示跳过按钮 */
		showSkip: Boolean,
		/** 是否启用工具栏（只在align=R时有效） */
		showTools: Boolean,
		/** 进度展示 */
		progress: { type: Number, default: -1 }
	});

	// -- emits
	// -- @play：音频播放（调用者需自行通过Audio实例对象播放）
	// -- @stop：音频停止（调用者需自行通过Audio实例对象停止）
	// -- @undo：点击撤销时触发（返回源数据）
	// -- @skip：点击跳过时触发
	// -- @openTools：打开工具栏时触发，调用者需保存回调函数（closeTools），并在点击页面时调用回调函数关闭工具栏
	const emits = defineEmits(['play', 'stop', 'undo', 'skip', 'openTools'])

	// -- state 
	const state = reactive({
		/* 消息类型 AUDIO(音频)/TEXT(普通文本) */
		messageType: '',
		/* 容器宽度：消息为音频时动态计算 */
		wrapWidth: 'auto',
		/* 工具栏展示状态 */
		openTools: false,
		/* 标识是否未读（语音）*/
		isUnRead: !props.readStatus,
	});

	// -- styles 
	const mergedColorOptions = {
		/** 主色，控制跳过/进度等内容的颜色 */
		primaryColor: "#A594FF",
		/** 聊天框(左侧)颜色 */
		LBgColor: "#FFFFFF",
		/** 聊天框(右侧)颜色 */
		RBgColor: "#A594FF",
		/** 文本颜色(左侧) */
		LTextColor: "#1A1A1A",
		/** 文本颜色(右侧) */
		RTextColor: "#FFFFFF",
		/** 语音动效元素背景颜色（左侧） */
		LAniBgColor: "#A594FF",
		/** 语音动效元素背景颜色（右侧） */
		RAniBgColor: "#FFFFFF"
	}
	const colorOptions = Object.assign({}, mergedColorOptions, props.colorOptions);
	const varStyles = {
		'--bg-color': props.align === 'L' ? colorOptions.LBgColor : colorOptions.RBgColor,
		'--ani-color': props.align === 'L' ? colorOptions.LAniBgColor : colorOptions.RAniBgColor,
		'--text-color': props.align === 'L' ? colorOptions.LTextColor : colorOptions.RTextColor,
		'--primary-color': colorOptions.primaryColor,
	}
	const avatarLStyles = { visibility: props.align === 'L' ? 'visible' : 'hidden' }
	const avatarRStyles = { visibility: props.align === 'R' ? 'visible' : 'hidden' }
	const caseStyles = { justifyContent: props.align === 'L' ? 'flex-start' : 'flex-end' }
	const wrapStyles = { justifyContent: props.align === 'L' ? 'flex-start' : 'flex-end' }

	// -- life circles
	onMounted(() => {
		// 1. 获取消息类型（AUDIO/TEXT/IMAGE）
		state.messageType = getMessageType(props.message);
		// 2. 动态计算消息对话框的宽度(只针对音频计算)
		if (state.messageType === "AUDIO") {
			let percent = props.duration / props.maxDuration * 100;
			if (percent < 35) {
				percent = 35;
			} else if (percent > 100) {
				percent = 100;
			}
			state.wrapWidth = percent + '%';
		}
	});

	// -- methods 
	const getAudioCls = () => {
		const readStatus = props.readStatus ? '' : 'unread';
		const audioText = props.audioText ? 'hasText' : '';
		return `__wrap AUDIO ${props.align} ${readStatus} ${audioText}`
	}
	const getMessageType = (message) => {
		if (/\.(mp3|wav|ogg|aac)$/i.test(message)) {
			return "AUDIO";
		} else if (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(message)) {
			return "IMAGE";
		} else {
			return "TEXT"
		}
	}

	const closeTools = () => {
		state.openTools = false;
	}

	// -- events 
	const onAudioTap = () => {
		// 取消未阅读状态
		state.isUnRead = false;
		if (props.isPlaying) {
			// 如果当前音频正在播放，则触发stop事件
			emits("stop", props.meta);
		} else {
			// 如果当前音频停止播放，则触发play事件
			emits("play", props.meta)
		}
	}
	const onLongPress = () => {
		// -- 长按自己发送的消息时，显示工具栏
		if (props.align === 'R' && props.showTools) {
			emits("openTools", closeTools);
			state.openTools = true;
		}
	}
	const onToolItemTap = (eventName) => {
		state.openTools = false;
		emits(eventName, props.meta);
	}
	const onImagePreview = () => {
		uni.previewImage({
			urls: [props.message],
			current: 0,
			indicator: "none",
			longPressActions: true,
		})
	}
</script>


<template>
	<!-- 外层容器 -->
	<view class="lg-message-box" :style="varStyles" :id="Date.now()">
		<!-- 内层框容器（考虑到后期拓展/比如消息框底部添加其他数据展示，所以这里套了一层容器） -->
		<view class="lg-message-box__ct">

			<!-- 头像（左侧） -->
			<image class="__avatar" :src="avatar" mode="aspectFill" :style="avatarLStyles"></image>

			<!-- 消息框容器（限制消息框最大宽度） -->
			<view class="__case" :style="caseStyles">

				<!-- 1.图片 -->
				<view v-if="state.messageType === 'IMAGE'" class="__wrap IMAGE" style="position: relative;">
					<image :src="message" mode="widthFix" @click="onImagePreview" @longpress="onLongPress"></image>
					<!-- 工具 -->
					<view class="__tools" :class="{visible: state.openTools}">
						<view class="item" @click.stop="onToolItemTap('undo')">撤回</view>
					</view>
				</view>



				<!-- 2. 语音消息 / 文字消息  -->
				<view v-if="['AUDIO', 'TEXT'].includes(state.messageType) " :class="`__slotWraps ${align}` " :style="{ width: audioText ? 'auto' : state.wrapWidth}">

					<!-- 语音消息 Start -->
					<view v-if="state.messageType === 'AUDIO'" :class="getAudioCls()" :style="{...wrapStyles}" @click="onAudioTap" @longpress="onLongPress">
						<!-- 消息内容 -->
						<template>
							<!-- 持续时间：展示条件 → 右侧且语音文本不存在时 -->
							<view v-if="align === 'R'" class="__seconds" style="margin-right: 15rpx;">{{duration}}''</view>

							<!-- 语音动画 Satrt -->
							<!-- 喇叭效果 -->
							<view v-if="aniType === 'horn' " class="__aniHorn" :class="{running: isPlaying, R: align === 'R'}">
								<view class="item"></view>
								<view class="item"></view>
								<view class="item"></view>
							</view>
							<!-- 线条效果 -->
							<view v-else class="__aniLine" :class="{running: isPlaying}">
								<view class="item"></view>
								<view class="item"></view>
								<view class="item"></view>
								<view class="item"></view>
							</view>
							<!-- 语音动画 End -->

							<!-- 语音文本 -->
							<view v-if="audioText && align === 'L'" class="__audioText" style="margin-left: 15rpx;">{{audioText}}</view>

							<!-- 持续时间：展示条件 → 左侧且语音文本不存在时 -->
							<view v-if="!audioText && align === 'L'" class="__seconds" style="margin-left: 15rpx;">{{duration}}''</view>
						</template>

					</view>
					<!-- 语音消息 End -->

					<!-- 文字消息 Start -->
					<view v-if="state.messageType === 'TEXT'" :class="`__wrap TEXT `" :style="{...wrapStyles}" @longpress.stop="onLongPress">
						<template>
							<!-- 消息内容 -->
							<text>{{message}}</text>
							<!-- 展示Loading -->
							<view v-if="showLoading" class="__loading">
								<view class="item"></view>
								<view class="item"></view>
								<view class="item"></view>
							</view>
							<!-- 插槽：后缀 -->
							<slot name="suffix"></slot>
							<!-- 展示Icon -->
							<image v-if="showIcon" class="__icon" src="./images/icon_complete.png"></image>
							<!-- 展示进度数值 -->
							<text v-if="progress !== -1" class="__progress-v">{{progress}}%</text>
						</template>
						<!-- 进度条 -->
						<view v-if="progress !== -1" class="__progress" :style="{'--progress-percent': progress + '%'}"></view>
					</view>
					<!-- 文字消息 End -->

					<!-- 杂项元素 Start -->
					<!-- 工具 -->
					<view class="__tools" :class="{visible: state.openTools}">
						<view class="item" @click.stop="onToolItemTap('undo')">撤回</view>
					</view>
					<!-- 角标提示 -->
					<view :class="`angle ${align}`"></view>
					<!-- 跳过按钮 -->
					<template v-if="align === 'L' && showSkip">
						<view class="__skip" @click.stop="emits('skip')">跳过</view>
					</template>
					<!-- 杂项元素 End -->

					<!-- 自定义插槽 -->
					<slot name="bottom"></slot>

				</view>
			</view>
			<!-- 头像（右侧） -->
			<image class="__avatar" :src="avatar" mode="aspectFill" :style="avatarRStyles"></image>

		</view>
	</view>
</template>


<style lang="less" scoped>
	@import url("./anis/ani.css");

	.lg-message-box {
		padding: 12rpx 16rpx;
		font-size: 32rpx;
		line-height: 40rpx;
		word-break: break-all;
		color: var(--text-color);

		&__ct {
			display: flex;
			align-items: flex-start;
			position: relative;

			/** 用户头像 */
			.__avatar {
				width: 80rpx;
				height: 80rpx;
				background: #EEEEEE;
				border-radius: 12rpx;
				flex-shrink: 0;
			}

			/** 消息框容器 */
			.__case {
				flex: 1;
				margin: 0 18rpx;
				display: flex;
				/** 程序中通过脚本控制居左还是居右对齐（这里默认居左） */
				justify-content: flex-start;
				align-items: center;


				/** 工具栏 */
				.__tools {
					padding: 0 20rpx;
					height: 64rpx;
					background: #606062;
					border-radius: 16rpx;
					display: none;
					justify-content: center;
					align-items: center;
					position: absolute;
					top: calc(-64rpx - 18rpx);
					left: 0;
					font-size: 26rpx;
					color: #FFFFFF;

					&.visible {
						display: flex;
					}

					&::before {
						content: "";
						position: absolute;
						top: calc(100% - 1px);
						left: 50%;
						transform: translateX(-50%);
						border-width: 14rpx 14rpx 0 14rpx;
						border-style: solid;
						border-color: #606062 transparent transparent transparent;
					}
				}


				/** 语音/文本/图片/视频内容容器公共样式 */
				.__wrap {
					display: flex;
					align-items: center;
				}

				/** 语音/文字容器(支持自定义插槽) */
				.__slotWraps {
					background: var(--bg-color);
					box-sizing: border-box;
					min-height: 80rpx;
					border-radius: 12rpx;
					padding: 20rpx 30rpx;
					position: relative;
					/** 处理__wrap小于80rpx时，用于垂直居中 */
					display: flex;
					flex-direction: column;
					justify-content: center;

					/** 角标（三角形） */
					.angle {
						width: 0;
						height: 0;
						border-style: solid;
						border-width: 10rpx;
						position: absolute;
						top: 28rpx;

						&.L {
							border-color: transparent var(--bg-color) transparent transparent;
							right: 100%;
						}

						&.R {
							border-color: transparent transparent transparent var(--bg-color);
							left: 100%;
						}
					}
				}


				/** 图片样式 */
				.IMAGE {
					width: 60%;

					image {
						width: 100%;
					}
				}

				/** 语音样式 */
				.AUDIO {

					.__aniHorn {
						width: 32rpx;
						height: 36rpx;
						flex-shrink: 0;
						overflow: hidden;
						position: relative;

						&.R {
							transform: rotate(180deg);
						}

						.item {
							box-sizing: content-box;
							position: absolute;
							top: 50%;

							&:nth-child(1) {
								border-top: 8rpx solid transparent;
								border-right: 8rpx solid var(--ani-color);
								border-bottom: 8rpx solid transparent;
								border-radius: 50%;
								left: 8rpx;
								transform: translate(-50%, -50%);
							}

							&:nth-child(2) {
								width: 20rpx;
								height: 20rpx;
								border-radius: 50%;
								border: 4rpx solid transparent;
								border-right-color: var(--ani-color);
								right: calc(50% - 6rpx);
								transform: translateY(-50%);
							}

							&:nth-child(3) {
								width: 36rpx;
								height: 36rpx;
								border-radius: 50%;
								border: 4rpx solid transparent;
								border-right-color: var(--ani-color);
								right: 0;
								transform: translateY(-50%);
							}
						}

						&.running .item {
							&:nth-child(2) {
								opacity: 0;
								animation: ani-horn-1 linear 1s infinite;
							}

							&:nth-child(3) {
								opacity: 0;
								animation: ani-horn-2 linear 1s infinite;
							}
						}
					}

					.__aniLine {
						display: flex;
						justify-content: center;
						align-items: center;
						flex-shrink: 0;
						position: relative;

						.item {
							width: 4rpx;
							height: 28rpx;
							background-color: var(--ani-color);

							&:not(:last-child) {
								margin-right: 6rpx;
							}

							&:nth-child(1) {
								transform: scaleY(.5);
							}

							&:nth-child(2) {
								transform: scaleY(1);
							}

							&:nth-child(3) {
								transform: scaleY(.6);
							}

							&:nth-child(4) {
								transform: scaleY(.35);
							}

						}

						&.running .item {
							animation: line-scale-pulse-out 1s infinite;

							&:nth-child(1) {
								animation-delay: -.5s;
							}

							&:nth-child(2) {
								animation-delay: -.7s;
							}

							&:nth-child(3) {
								animation-delay: -.9s;
							}

							&:nth-child(4) {
								animation-delay: -.7s;
							}
						}
					}

					&.L.unread::before {
						content: '';
						width: 20rpx;
						height: 20rpx;
						border-radius: 50%;
						background: red;
						position: absolute;
						top: 50%;
						transform: translateY(-50%);
						right: -40rpx;
					}

					/** 语音+文本时 */
					&.hasText {
						align-items: flex-start;

						/** 微调语音动效元素的位置 */
						.__aniHorn {
							top: 2rpx;
						}

						.__aniLine {
							top: 6rpx;
						}
					}
				}

				/** 文本样式 */
				.TEXT {

					.__icon {
						width: 34rpx;
						height: 34rpx;
						margin-left: 15rpx;
					}

					.__progress-v {
						width: 90rpx;
						text-align: right;
						color: var(--primary-color);
						margin-left: 15rpx;
					}

					.__progress {
						width: 100%;
						height: 100%;
						border-radius: 12rpx;
						overflow: hidden;
						background: transparent;
						position: absolute;
						top: 0;
						left: 0;

						&::after {
							content: '';
							display: block;
							transition: width .25s linear;
							width: var(--progress-percent);
							height: 2rpx;
							background-color: var(--primary-color);
							position: absolute;
							left: 0;
							bottom: 0;
						}
					}

					.__loading {
						display: flex;
						justify-content: center;
						align-items: center;
						margin-left: 15rpx;

						.item {
							background: var(--primary-color);
							vertical-align: middle;
							opacity: 0;

							&:nth-child(1) {
								width: 8rpx;
								height: 8rpx;
								border-radius: 50%;
								animation: ani-loading-1 2s linear infinite;
							}

							&:nth-child(2) {
								width: 8rpx;
								height: 16rpx;
								border-radius: 4rpx;
								margin: 0 6rpx;
								animation: ani-loading-2 2s linear infinite;
							}

							&:nth-child(3) {
								width: 8rpx;
								height: 24rpx;
								border-radius: 4rpx;
								animation: ani-loading-3 2s linear infinite;
							}
						}
					}
				}
			}


			/** 跳过按钮 */
			.__skip {
				font-size: 32rpx;
				line-height: 44rpx;
				color: var(--primary-color);
				position: absolute;
				right: -84rpx;
				bottom: 0;
			}
		}
	}
</style>