<script setup>
	import { nextTick, onMounted, reactive, ref } from "vue";
	import AppHeader from '@/components/@lgs/AppHeader/AppHeader.vue';
	import MessageBox from '@/components/@lgs/MessageBox/MessageBox.vue'
	import ScrollList from '@/components/@lgs/ScrollList/ScrollList.vue';
	import VoiceBar from '@/components/@lgs/VoiceBar/VoiceBar.vue';
	import Utils from "@/utils";


	// -- refs 
	const scroll = ref();
	// -- constants
	const avatarAi = 'https://ai-resume.oss-cn-shenzhen.aliyuncs.com/resume/images/icon/20230331/1680245672803/icon_ai.png';
	const avatarUser = 'https://img2.baidu.com/it/u=1310500653,368013655&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500';
	const iconRefresh = 'https://ai-resume.oss-cn-shenzhen.aliyuncs.com/resume/images/icon/20230419/1681874998718/icon_shuaxin@2x.png';
	const iconComplete = 'https://ai-resume.oss-cn-shenzhen.aliyuncs.com/resume/images/icon/20230419/1681875229488/icon_wancheng@2x.png';
	// -- APIs 
	const audio = uni.createInnerAudioContext();
	const recorder = uni.getRecorderManager();

	// -- state 
	const state = reactive({
		/** 录音操作 */
		recorderAction: "",
		/** 播放队列，控制自动播放（当用户点击未读语音时，会将后续未读语音加入队列自动播放） */
		queue: [],
		/** 当前播放对象 */
		current: null,
		/** 当前进度 */
		progress: -1,
		clearTimers: null,
		showWaitAgain: false,
		showIconComplete: false,
		/** 源数据列表 */
		list: [{
				id: 1,
				align: "L",
				voiceDataUrl: 'https://ai-resume.oss-cn-shenzhen.aliyuncs.com/resume/file/promptTone/20230403/1680504824199/1_welcome_defaultwoman.mp3',
				duration: 30,
				readStatus: 0,
				isPlaying: false,
			},
			{
				id: 2,
				align: "L",
				voiceDataUrl: "https://ai-resume.oss-cn-shenzhen.aliyuncs.com/resume/file/promptTone/20230403/1680504876955/2_baseInfo_defaultwoman.mp3",
				duration: 30,
				readStatus: 0,
				isPlaying: false,
				audioText: '你只需要跟我说6句话，我就能给你生成十分的简历'
			},
			{
				id: 3,
				align: "R",
				voiceDataTxt: "今天天气怎么样？",
			},
			{
				id: 4,
				align: "L",
				voiceDataTxt: "今天天气很不错",
				showSkip: true
			},
			{
				id: 5,
				align: "R",
				voiceDataTxt: "给我一张美女的照片",
			},
			{
				id: 6,
				align: "L",
				voiceDataTxt: "正在处理",
				showLoading: true
			},
			{
				id: 7,
				align: "L",
				voiceDataTxt: "已生成",
				showIcon: true,
			},
			{
				id: 8,
				align: "L",
				voiceDataTxt: "https://photo69.mac89.com/180710/JPG-180710_141/orrel12fFF_small.jpg",
			},
			{
				id: 9,
				align: "R",
				voiceDataTxt: "床前明月光",
			}, {
				id: 10,
				align: "L",
				voiceDataTxt: "地上鞋两双",
			},
		]
	});
	// -- life circles 
	onMounted(() => {
		// 1. 监听音频
		listener();
		// 2. 自动播放
		// onPlay(state.list[0]);
		if (uni.getStorageSync('__kPROGRESS_')) {
			onStartProgress();
		}
	});

	// -- methods
	const listener = () => {
		// @音频播放完毕
		audio.onEnded(() => {
			// 1. 更新当前正在播放的音频UI状态
			state.current.isPlaying = false;
			state.queue.shift();
			// 2. 判断自动播放队列是否有值，有值则根据队列顺序播放
			if (state.queue.length > 0) {
				// -- 获取当前需要播放的音频数据
				const meta = state.queue[0];
				// -- 记录当前播放的音频数据（用于下次播放之前控制UI状态）
				state.current = meta;
				// -- 播放音频
				audio.src = meta.voiceDataUrl;
				audio.play();

				// -- 更新当前音频UI状态
				meta.isPlaying = true;
				meta.readStatus = 1;
			}
		});
		// @录音结束
		recorder.onStop(({ duration, tempFilePath }) => {
			if (state.recorderAction === "SEND") {
				state.list.push({
					align: "R",
					voiceDataUrl: tempFilePath,
					duration: parseInt(duration / 1000),
					readStatus: 0,
					isPlaying: false,
				});
				nextTick(() => {
					scroll.value.scrollToBottom();
				})
			}
		})
	}


	// -- events 
	/**
	 * 播放音频
	 */
	const playAudio = (data) => {
		// 1. 如果当前已存在播放音频对象，则取消其播放状态（控制UI状态）
		if (state.current) {
			state.current.isPlaying = false;
		}
		// 2. 记录当前播放的音频数据（用于下次播放之前控制UI状态）
		state.current = data;

		// 3. 播放当前音频
		audio.src = data.voiceDataUrl;
		audio.play();

		// 4. 查询是否存在未播放的音频（实现类似微信，点击未读语音时，自动播放当前语音后面的未读消息）
		const index = state.list.findIndex(item => item.id === data.id);
		if (index !== -1) {
			for (let i = index; i < state.list.length; i++) {
				const t = state.list[i];
				// 当消息在左侧（即发送方）并且是未读的语音消息才加入自动播放队列
				if (t.align === 'L' && !t.readStatus && t.voiceDataUrl) {
					state.queue.push(t);
				}
			}
		}

		// 5. 更新当前音频UI状态
		data.isPlaying = true;
		data.readStatus = 1;
	}
	/**
	 * 停止音频
	 */
	const stopAudio = (data) => {
		// 1. 停止音频
		audio.stop();
		// 2. 更新UI状态
		data.isPlaying = false;
		// 3. 清空播放队列
		state.queue = [];
	}

	/**
	 * 开始录音
	 */
	const onRecorderStart = ({ next }) => {
		if (state.current) {
			stopAudio(state.current);
		}
		uni.vibrateShort({ type: "medium" });
		recorder.start({ format: 'mp3' });
		next();
	}

	/**
	 * 停止录音
	 */
	const onRecorderStop = ({ type, next }) => {
		state.recorderAction = type;
		next();
		recorder.stop();
	}
	const onHeightChange = (height) => {
		setTimeout(() => {
			scroll.value.scrollToBottom();
		}, 300)
	}
	const onSendMessage = (message) => {
		state.list.push({
			id: Date.now(),
			align: "R",
			voiceDataTxt: message,
		});
	}

	const onStartProgress = () => {
		const { clearTimers, done } = Utils.renderProgress({
			pending: (progress) => {
				state.progress = progress;
			},
			ended: (progress) => {
				console.log("定时器伪加载结束，更新UI，提示用户：抱歉，可能需要等待一会儿");
				state.showWaitAgain = true;
				state.progress = progress;
			},
			complete: () => {
				state.progress = -1;
				state.showWaitAgain = false;
				state.showIconComplete = true;
				console.log("实际加载完成");
			}
		});
		setTimeout(() => {
			console.log("手动触发请求完成");
			done();
		}, 20 * 1000);
	}
</script>


<template>
	<view class="page">
		<!-- 导航栏 -->
		<app-header title="消息列表"></app-header>
		<!-- 消息栏 -->
		<scroll-list ref="scroll" class="scroll">
			<!-- 生成简历 -->
			<view class="btn flex-h-center mx-auto rounded-12 mt-20" @click="onStartProgress">生成简历</view>
			<!-- 测试插槽#suffix -->
			<message-box v-if="state.progress !== -1" align="L" :avatar="avatarAi" message="简历生成中，请稍后" :progress="state.progress" />
			<message-box v-if="state.showWaitAgain" align="L" :avatar="avatarAi" message="抱歉，可能需要等待一会儿" />
			<message-box v-if="state.showIconComplete" align="L" :avatar="avatarAi" message="简历已生成" showIconComplete />
			<!-- 测试插槽：#bottom -->
			<message-box align="L" showIconText :avatar="avatarAi" message="你好,我是耀哥,欢迎来到耀哥课堂,在开始之前请您做一个简单的自我介绍">
				<template #bottom>
					<view class="flex-h-end f32 " style="color: #8061FF;">
						<view class="flex-h-center ">
							<image class="icon-32x32" src="https://ai-resume.oss-cn-shenzhen.aliyuncs.com/resume/images/icon/20230420/1681979586521/icon_tiaoguo@2x.png"></image>
							<text class="ml-8 ">跳过</text>
						</view>
					</view>
				</template>
				<template #extra>
					<view style="height: 100rpx; background-color: orange; margin-top: 20rpx;"></view>
				</template>
			</message-box>
			<!-- 列表消息 -->
			<block v-for="(item, index) in state.list" :key="index">
				<message-box :align="item.align" showTools :meta="item" :showIconText="item.showIconText" :avatar="avatarAi" :showSkip="item.showSkip" :audioText="item.audioText" :showIconComplete="item.showIcon" :showLoading="item.showLoading" :isPlaying="item.isPlaying" :readStatus="item.readStatus" :message="item.voiceDataTxt || item.voiceDataUrl" :duration="item.duration" @play="playAudio" @stop="stopAudio" />
			</block>
			<view class="space-88"></view>
		</scroll-list>


		<!-- 底部栏 -->
		<voice-bar useDrawer userTips="长按可以发送语音哟~" @start="onRecorderStart" @stop="onRecorderStop" @sendMsg="onSendMessage" @heightChange="onHeightChange">

		</voice-bar>
	</view>
</template>


<style lang="less" scoped>
	.page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.scroll {
		flex: 1;
		position: relative;
	}

	.btn {
		width: 200rpx;
		height: 80rpx;
		border: 2rpx solid cornflowerblue;
	}
</style>