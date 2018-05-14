<template>
  <div class="auth" v-if="showLayer">
    <div class="auth-mask"></div>
    <div class="auth-dialog">
      <div class="icon-close" @click="show = 0">
        <div class="icon-close-text">+</div>
      </div>
      <div class="auth-dialog-title">请先登录</div>
      <div class="auth-dialog-content">
        <button open-type="getUserInfo" @getuserinfo="getUserInfo">微信授权登录</button>
        <div class="text-warn">{{errorMessage}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import store from '@/store'

export default {
  props: ['show'],
  data () {
    return {
      showLayer: false,
      errorMessage: ''
    }
  },
  created () {
    this.showLayer = this.show
  },
  watch: {
    'show': 'changeShow'
  },
  methods: {
    getUserInfo (data) {
      // console.log(data.mp.detail)
      if (data.mp.detail.userInfo) {
        // success
        store.dispatch('getUserInfo')
        this.errorMessage = '用户授权登录成功'
        this.showLayer = 0
      } else {
        this.errorMessage = '用户授权登录失败'
      }
    },
    changeShow (newVal) {
      if (this.showLayer !== newVal) {
        this.showLayer = newVal
      }
      if (!newVal) {
        this.$emit('hide')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../scss/mixin';
.auth {
  &-mask {
    position: fixed;
    z-index: 300;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: .5;
    background: #000;
  }
  &-dialog {
    position: fixed;
    z-index: 301;
    top: 20%;
    left: 7%;
    right: 7%;
    width: 86%;
    padding-bottom: 10px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    border-top-color: $main-color;
    font-size: 36rpx;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    text-align: left;
    overflow: hidden;
    backface-visibility: hidden;

    &-title {
      padding: 30rpx;
      color: $main-color;
    }
    &-content {
      padding: 20rpx 30rpx;
      color: #888;
    }
    .icon-close {
      // display: none;
      right: 0;
      top: 10px;
    }
  }
}
.text-warn {
  margin-top: 20px;
}
</style>
