<script>
	import Utils from './utils';
	export default {
		globalData: {
			$utils: Utils
		},
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="less">
	@import url("./global.css");
</style>
