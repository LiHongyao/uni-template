<script setup>
	import { onLoad } from "@dcloudio/uni-app";
	import { reactive, getCurrentInstance } from "vue";
	import Utils from '@/utils/index.js';

	// -- constants
	// -- refs
	// -- state
	const state = reactive({
		eventChannel: null
	})
	// -- life circles
	onLoad(({ q }) => {
		// -- 接收Querys
		console.log(q);
		// -- 接收参数
		const { proxy } = getCurrentInstance();
		state.eventChannel = proxy.getOpenerEventChannel();
		state.eventChannel.on("acceptDataFromIndex", data => {
			console.log(data);
		});
	});
	// -- methods
	// -- events
	const onButtonTap = () => {
		state.eventChannel.emit('acceptDataFromOrders', { message: 'Hello, 我来自订单页~' });
		Utils.pop();
	}
</script>
<template>
	<view class="page px-30 pt-108">
		<button type="primary" @click="onButtonTap">发送数据</button>
	</view>
</template>
