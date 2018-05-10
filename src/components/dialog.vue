<template>
  <div class="confirm">
    <div class="confirm-mask" @click="cancel"></div>
    <div class="confirm-dialog">
      <div class="confirm-dialog-title">{{titleText}}</div>
      <div class="confirm-dialog-content">
        {{content}}
      </div>
      <div class="confirm-dialog-btns">
        <button type="warn" @click="submit">确定</button>
        <button @click="cancel">取消</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ['title', 'content'],
  data () {
    return {
      titleText: ''
    }
  },
  created () {
    if (!this.title) {
      this.titleText = '提醒'
    } else {
      this.titleText = this.title
    }
  },
  methods: {
    submit () {
      this.$emit('submit')
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../scss/mixin';

.confirm {
  &-mask {
    position: fixed;
    z-index: 200;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: .5;
    background: #000;
  }
  &-dialog {
    position: fixed;
    z-index: 201;
    top: 10%;
    left: 10%;
    right: 10%;
    width: 80%;
    padding-bottom: 10px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    font-size: 36rpx;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    text-align: left;
    overflow: hidden;
    backface-visibility: hid
    den;

    &-title {
      padding: 30rpx;
      color: $main-color;
    }
    &-content {
      padding: 20rpx 30rpx;
      color: #888;
    }
    &-btns {
      margin: 1.17647059em 15px .3em;
      button {
        margin-top: 15px;
        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
}
</style>

